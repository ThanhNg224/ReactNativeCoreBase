import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { onlineManager } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { SignInScreen } from '@/features/auth';
import { HomeScreen } from '@/features/home';
import { router } from 'expo-router';
import { toast } from '@/lib/toast';
import { AppearanceSheet, LanguageSheet, SettingsScreen } from '@/features/settings';
import { session, useSessionStore } from '@/lib/auth/session';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { queryClient } from '@/lib/query-client';
import { secureGet } from '@/lib/storage/secure';
import i18n from '@/lib/i18n';
import { server } from './server';
import { deferred, tokens, user } from './fixtures';
import { renderScreen } from './render';

beforeEach(async () => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  await session.signOut('user');
  usePreferencesStore.setState({ theme: 'system', language: 'en' });
  await i18n.changeLanguage('en');
});
const fill = async () => {
  await fireEvent.changeText(screen.getByLabelText('Username'), 'emilys');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'emilyspass');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
};

test('empty submission shows required validation for both fields', async () => {
  await renderScreen(<SignInScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(screen.getAllByText('This field is required')).toHaveLength(2));
});

test('login 400 displays invalid credentials', async () => {
  server.use(
    http.post('https://dummyjson.com/auth/login', () => new HttpResponse(null, { status: 400 }))
  );
  await renderScreen(<SignInScreen />);
  await fill();
  expect(await screen.findByText('Incorrect username or password')).toBeOnTheScreen();
});

test('successful login persists tokens and disables submit while pending', async () => {
  const entered = deferred();
  const release = deferred();
  server.use(
    http.post('https://dummyjson.com/auth/login', async () => {
      entered.resolve();
      await release.promise;
      return HttpResponse.json({ ...tokens, ...user });
    })
  );
  await renderScreen(<SignInScreen />);
  await fill();
  await entered.promise;
  await waitFor(() => expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled());
  release.resolve();
  await waitFor(() => expect(useSessionStore.getState().status).toBe('signedIn'));
  expect(await secureGet('auth.accessToken')).toBe(tokens.accessToken);
  expect(await secureGet('auth.refreshToken')).toBe(tokens.refreshToken);
  expect(await secureGet('auth.user')).toBe(JSON.stringify(user));
});

test('settings rows show current preferences and open their sheets', async () => {
  const push = jest.spyOn(router, 'push').mockImplementation(() => {});
  await renderScreen(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Appearance, System' }));
  expect(push).toHaveBeenCalledWith('/appearance');
  await fireEvent.press(screen.getByRole('button', { name: 'Language, English' }));
  expect(push).toHaveBeenCalledWith('/language');
});

test('appearance and language sheets update preferences and translate immediately', async () => {
  jest.spyOn(router, 'back').mockImplementation(() => {});
  const view = await renderScreen(<AppearanceSheet />);
  await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }));
  expect(usePreferencesStore.getState().theme).toBe('dark');
  expect(router.back).toHaveBeenCalled();
  await view.unmount();
  await renderScreen(<LanguageSheet />);
  await fireEvent.press(screen.getByRole('radio', { name: 'Tiếng Việt' }));
  expect(usePreferencesStore.getState().language).toBe('vi');
  expect(await screen.findByText('Ngôn ngữ')).toBeOnTheScreen();
  expect(toast.success).toHaveBeenLastCalledWith('Đã cập nhật ngôn ngữ');
});

test('sign out asks for confirmation before ending the session', async () => {
  await session.signIn(tokens, user);
  await renderScreen(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByText('Sign out?')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
  expect(useSessionStore.getState().status).toBe('signedIn');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
  const [, confirm] = await screen.findAllByRole('button', { name: 'Sign out' });
  await fireEvent.press(confirm!);
  await waitFor(() => expect(useSessionStore.getState().status).toBe('signedOut'));
});

test('home network failure displays retry and retry fetches profile', async () => {
  await session.signIn(tokens, user);
  queryClient.setQueryDefaults(['auth', 'me'], { retry: false });
  let attempts = 0;
  server.use(
    http.get('https://dummyjson.com/auth/me', () => {
      attempts++;
      return attempts === 1 ? HttpResponse.error() : HttpResponse.json(user);
    })
  );
  await renderScreen(<HomeScreen />);
  expect(await screen.findByText('Check your connection and try again.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() =>
    expect(screen.queryByText('Check your connection and try again.')).toBeNull()
  );
  expect(screen.getByText('Emily Johnson')).toBeOnTheScreen();
  queryClient.setQueryDefaults(['auth', 'me'], {});
});

describe('offline', () => {
  afterEach(() => act(async () => onlineManager.setOnline(true)));

  test('sign-in while offline fails fast with a network error and re-enables submit', async () => {
    onlineManager.setOnline(false);
    server.use(http.post('https://dummyjson.com/auth/login', () => HttpResponse.error()));
    await renderScreen(<SignInScreen />);
    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    await fill();
    expect(await screen.findByText('Check your connection and try again.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  test('home keeps the cached profile while offline and refreshes on reconnect', async () => {
    await session.signIn(tokens, user);
    let requests = 0;
    server.use(
      http.get('https://dummyjson.com/auth/me', () => {
        requests++;
        return HttpResponse.json({ ...user, firstName: 'Emma' });
      })
    );
    onlineManager.setOnline(false);
    await renderScreen(<HomeScreen />);
    expect(screen.getByText('Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(requests).toBe(0);
    await act(async () => onlineManager.setOnline(true));
    expect(await screen.findByText('Emma Johnson')).toBeOnTheScreen();
    expect(screen.queryByText("You're offline")).toBeNull();
    expect(requests).toBe(1);
  });
});

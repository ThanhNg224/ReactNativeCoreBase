import { renderRouter, screen, fireEvent, waitFor } from 'expo-router/testing-library';
import { http, HttpResponse } from 'msw';
import { session, useSessionStore } from '@/lib/auth/session';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { queryClient } from '@/lib/query-client';
import i18n from '@/lib/i18n';
import { server } from './server';
import { tokens, user } from './fixtures';

beforeEach(async () => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  await session.signOut('user');
  usePreferencesStore.setState({ theme: 'system', language: 'en' });
  await i18n.changeLanguage('en');
});

afterEach(() => {
  jest.useRealTimers();
});

test('protected routes: sign-in → home → settings → sign-out clears query cache', async () => {
  server.use(
    http.post('https://dummyjson.com/auth/login', () => HttpResponse.json({ ...tokens, ...user })),
    http.get('https://dummyjson.com/auth/me', () => HttpResponse.json(user))
  );
  const app = renderRouter('src/app', { initialUrl: '/' });
  await app;
  expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByLabelText('Username'), 'emilys');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'emilyspass');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
  await waitFor(() => expect(app.getPathname()).toBe('/'));
  await fireEvent.press(screen.getByText('Settings'));
  expect(await screen.findByText('Appearance')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByText('Sign out?')).toBeOnTheScreen();
  // The destructive dialog action confirms; the row itself only asks.
  const [, confirm] = screen.getAllByRole('button', { name: 'Sign out' });
  await fireEvent.press(confirm!);
  expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
  await waitFor(() => expect(queryClient.getQueryCache().getAll()).toHaveLength(0));
  expect(useSessionStore.getState().status).toBe('signedOut');
});

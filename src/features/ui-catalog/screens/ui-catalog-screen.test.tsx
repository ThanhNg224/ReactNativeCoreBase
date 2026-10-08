import { fireEvent, screen } from '@testing-library/react-native';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { renderScreen } from '@/test/render';
import { FormControlsSection } from '../components/form-controls-section';
import { DataDisplaySection } from '../components/data-states-section';
import { UiCatalogScreen } from './ui-catalog-screen';

test('form control rows expose one named control and toggle their checked state', async () => {
  await renderScreen(<FormControlsSection />);
  const checkbox = screen.getByRole('checkbox', { name: 'Checkbox' });
  expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  expect(checkbox).toBeChecked();
  await fireEvent.press(checkbox);
  expect(checkbox).not.toBeChecked();

  const toggle = screen.getByRole('switch', { name: 'Switch' });
  expect(screen.getAllByRole('switch')).toHaveLength(1);
  expect(toggle).not.toBeChecked();
  await fireEvent.press(toggle);
  expect(toggle).toBeChecked();

  expect(screen.getAllByRole('radio')).toHaveLength(2);
  await fireEvent.press(screen.getByRole('radio', { name: 'Option two' }));
  expect(screen.getByRole('radio', { name: 'Option two' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Option one' })).not.toBeChecked();
});

test('the list switch toggles through its named row', async () => {
  await renderScreen(<DataDisplaySection />);
  const toggle = screen.getByRole('switch', { name: 'With switch' });
  expect(screen.getAllByRole('switch')).toHaveLength(1);
  expect(toggle).toBeChecked();
  await fireEvent.press(toggle);
  expect(toggle).not.toBeChecked();
});

test('the named dark mode control updates the theme preference', async () => {
  usePreferencesStore.setState({ theme: 'light' });
  await renderScreen(<UiCatalogScreen />);
  await fireEvent.press(screen.getByRole('switch', { name: 'Dark mode' }));
  expect(usePreferencesStore.getState().theme).toBe('dark');
});

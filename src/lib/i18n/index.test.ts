import i18n from './index';
import { LANGUAGES } from './languages';

test('translation keys are typed and Vietnamese resources load', async () => {
  // @ts-expect-error Unknown translation keys must fail typecheck.
  i18n.t('common.missingKey');
  await i18n.changeLanguage('vi');
  expect(i18n.t('common.hello')).toBe('Xin chào');
});

test('every registered language has exactly the English key set', () => {
  const keys = (value: unknown, prefix = ''): string[] =>
    Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      typeof child === 'object' && child !== null
        ? keys(child, `${prefix}${key}.`)
        : [`${prefix}${key}`]
    );
  const expected = keys(LANGUAGES.en.resources).sort();
  for (const [code, { resources }] of Object.entries(LANGUAGES)) {
    expect({ code, keys: keys(resources).sort() }).toEqual({ code, keys: expected });
  }
});

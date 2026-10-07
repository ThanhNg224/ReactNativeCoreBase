import i18n from './index';

test('translation keys are typed and Vietnamese resources load', async () => {
  // @ts-expect-error Unknown translation keys must fail typecheck.
  i18n.t('common.missingKey');
  await i18n.changeLanguage('vi');
  expect(i18n.t('common.hello')).toBe('Xin chào');
});

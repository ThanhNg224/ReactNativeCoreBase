import { secureDelete, secureGet, secureSet } from './secure';

test('writes and deletes remain in invocation order without awaiting', async () => {
  const first = secureSet('A', 'first');
  const deleted = secureDelete('A');
  const last = secureSet('A', 'last');
  await Promise.all([first, deleted, last]);
  expect(await secureGet('A')).toBe('last');
});

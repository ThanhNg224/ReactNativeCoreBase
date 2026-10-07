const { ESLint } = require('eslint');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let fixture;
let eslint;
beforeAll(() => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'corebase-boundaries-'));
  for (const feature of ['alpha', 'beta'])
    fs.mkdirSync(path.join(fixture, 'src/features', feature), { recursive: true });
  fs.copyFileSync(
    path.join(__dirname, '../eslint.config.cjs'),
    path.join(fixture, 'eslint.config.cjs')
  );
  fs.symlinkSync(
    path.join(__dirname, '../node_modules'),
    path.join(fixture, 'node_modules'),
    'dir'
  );
  eslint = new ESLint({
    cwd: fixture,
    overrideConfigFile: true,
    overrideConfig: require(path.join(fixture, 'eslint.config.cjs')),
  });
});
afterAll(() => fs.rmSync(fixture, { recursive: true, force: true }));

const importSource = (source) => `import { value } from '${source}'; export const used = value;`;
async function rules(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath: path.join(fixture, filePath) });
  return result.messages.map((message) => message.ruleId);
}

test.each([
  ['src/features/alpha/screen.tsx', '@/features/beta'],
  ['src/features/alpha/screen.tsx', '@/features/beta/internal'],
  ['src/features/alpha/screen.tsx', '@/app/_layout'],
  ['src/features/alpha/screen.tsx', '@/providers/app-providers'],
  ['src/app/screen.tsx', '@/features/alpha/internal'],
  ['src/components/shared.tsx', '@/features/alpha'],
  ['src/components/shared.tsx', '@/app/_layout'],
  ['src/components/shared.tsx', '@/providers/app-providers'],
  ['src/lib/helper.ts', '@/features/alpha'],
  ['src/lib/helper.ts', '@/components/shared'],
  ['src/lib/helper.ts', '@/providers/app-providers'],
  ['src/features/alpha/screen.tsx', '../../lib/helper'],
  ['src/app/_layout.tsx', '../../global.css'],
  ['src/root.ts', 'expo-secure-store'],
  ['src/root.ts', 'react-native-mmkv'],
  ['src/features/alpha/screen.tsx', 'expo-secure-store'],
])('forbids %s importing %s', async (filePath, source) => {
  expect(await rules(importSource(source), filePath)).toContain('no-restricted-imports');
});

test.each([
  ['src/features/alpha/index.ts', '../beta'],
  ['src/lib/helper.ts', '../features/alpha'],
  ['src/components/shared.tsx', '../features/alpha'],
  ['src/app/screen.tsx', '../features/alpha/internal'],
  ['src/providers/shared.tsx', '../app/_layout'],
])('relative paths cannot bypass boundaries: %s → %s', async (filePath, source) => {
  expect(await rules(importSource(source), filePath)).toContain('architecture/relative-boundaries');
});

test.each([
  'src/root.ts',
  'src/features/alpha/screen.tsx',
  'src/components/shared.tsx',
  'src/lib/helper.ts',
])('forbids raw fetch in %s', async (filePath) => {
  expect(
    await rules("export const ping = () => fetch('https://example.com');", filePath)
  ).toContain('no-restricted-globals');
  expect(
    await rules("export const ping = () => globalThis.fetch('https://example.com');", filePath)
  ).toContain('no-restricted-properties');
});

test.each(['URL', 'URLSearchParams', 'TextEncoder', 'TextDecoder', 'crypto'])(
  'keeps runtime restriction %s inside API',
  async (name) => {
    expect(await rules(`export const value = ${name};`, 'src/lib/api/probe.ts')).toContain(
      'no-restricted-globals'
    );
    expect(
      await rules(`export const value = globalThis.${name};`, 'src/lib/api/probe.ts')
    ).toContain('no-restricted-properties');
  }
);
test.each(['timeout', 'any'])('forbids AbortSignal.%s', async (property) => {
  expect(
    await rules(`export const value = AbortSignal.${property};`, 'src/lib/api/probe.ts')
  ).toContain('no-restricted-properties');
});

test('features use styling tokens', async () => {
  expect(
    await rules(
      "import {View} from 'react-native'; export const Screen = () => <View style={{flex:1}} />;",
      'src/features/alpha/screen.tsx'
    )
  ).toContain('no-restricted-syntax');
  expect(await rules("export const color = '#112233';", 'src/features/alpha/screen.tsx')).toContain(
    'no-restricted-syntax'
  );
});

test.each([
  ['src/app/screen.tsx', importSource('@/features/alpha')],
  ['src/features/alpha/index.ts', "export {value} from './internal';"],
  ['src/features/alpha/screen.tsx', importSource('@/lib/helper')],
  ['src/lib/storage/secure.ts', importSource('expo-secure-store')],
  ['src/lib/storage/kv.ts', importSource('react-native-mmkv')],
  ['src/lib/api/probe.ts', "export const ping = () => fetch('https://example.com');"],
  ['src/test/probe.ts', "export const ping = () => globalThis.fetch('https://example.com');"],
  ['src/app/_layout.tsx', "import '@styles'; export const value = 1;"],
])('allows valid code in %s', async (filePath, code) => {
  expect(await rules(code, filePath)).toEqual([]);
});

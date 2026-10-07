const fs = require('node:fs');
const path = require('node:path');
const js = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');

const runtimeMessage = 'Not guaranteed under React Native/Hermes; use supported native APIs.';
const runtimeGlobals = ['URL', 'URLSearchParams', 'TextDecoder', 'TextEncoder', 'crypto'].map(
  (name) => ({ name, message: runtimeMessage })
);
const storagePaths = ['react-native-mmkv', 'expo-secure-store'].map((name) => ({
  name,
  message: 'Storage packages may only be imported in src/lib/storage/**.',
}));
const relativePattern = {
  group: ['../../*'],
  message: 'Use aliases for imports beyond one parent.',
};
const restrictedProperties = [
  ...['timeout', 'any'].map((property) => ({
    object: 'AbortSignal',
    property,
    message: runtimeMessage,
  })),
  ...['globalThis', 'global'].flatMap((object) =>
    runtimeGlobals.map(({ name, message }) => ({ object, property: name, message }))
  ),
];
const fetchGlobal = { name: 'fetch', message: 'Use apiRequest outside lib/api and test helpers.' };
const fetchProperties = ['globalThis', 'global'].map((object) => ({
  object,
  property: 'fetch',
  message: fetchGlobal.message,
}));
const features = fs
  .readdirSync(path.join(__dirname, 'src/features'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

function importRule(forbidden = [], allowStorage = false) {
  return [
    'error',
    {
      paths: allowStorage ? [] : storagePaths,
      patterns: [
        relativePattern,
        ...forbidden.map((layer) => ({
          group: [layer, `${layer}/**`],
          message: 'Import crosses an architectural boundary.',
        })),
      ],
    },
  ];
}

// Alias patterns cannot see relative imports. Resolve those against the source file.
const relativeBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      boundary:
        'Relative import crosses an architectural boundary; use the permitted layer entry point.',
    },
  },
  create(context) {
    const filename = path.join(
      fs.realpathSync(context.cwd),
      path.relative(context.cwd, context.filename)
    );
    const from = path.relative(__dirname, filename).split(path.sep).join('/');
    function check(node) {
      const source = node.source?.value;
      if (typeof source !== 'string' || !source.startsWith('.')) return;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), source));
      const layer = target.split('/')[1];
      const feature = from.match(/^src\/features\/([^/]+)\//)?.[1];
      const targetFeature = target.match(/^src\/features\/([^/]+)/)?.[1];
      const forbidden =
        (feature &&
          (['app', 'providers'].includes(layer) || (targetFeature && feature !== targetFeature))) ||
        (from.startsWith('src/lib/') &&
          ['features', 'components', 'app', 'providers'].includes(layer)) ||
        (from.startsWith('src/components/') && ['features', 'app', 'providers'].includes(layer)) ||
        (from.startsWith('src/providers/') && ['features', 'app'].includes(layer)) ||
        (from.startsWith('src/app/') && targetFeature && !/^src\/features\/[^/]+$/.test(target));
      if (forbidden) context.report({ node: node.source, messageId: 'boundary' });
    }
    return { ImportDeclaration: check, ExportNamedDeclaration: check, ExportAllDeclaration: check };
  },
};

module.exports = defineConfig([
  {
    ignores: [
      'android/**',
      'ios/**',
      '.expo/**',
      '.idea/**',
      'dist/**',
      'coverage/**',
      'docs/plans/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['scripts/**/*.test.cjs'],
    languageOptions: {
      globals: Object.fromEntries(
        [
          'describe',
          'test',
          'it',
          'expect',
          'beforeEach',
          'afterEach',
          'beforeAll',
          'afterAll',
          'jest',
        ].map((name) => [name, 'readonly'])
      ),
    },
  },
  { files: ['**/*.{ts,tsx}'], rules: { 'no-restricted-imports': importRule() } },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    plugins: { architecture: { rules: { 'relative-boundaries': relativeBoundaries } } },
    rules: {
      'architecture/relative-boundaries': 'error',
      'no-restricted-globals': ['error', ...runtimeGlobals, fetchGlobal],
      'no-restricted-properties': ['error', ...restrictedProperties, ...fetchProperties],
    },
  },
  ...features.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': importRule([
        '@/app',
        '@/providers',
        ...features.filter((other) => other !== feature).map((other) => `@/features/${other}`),
      ]),
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression',
          message: 'Use className instead of inline style objects in features.',
        },
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message: 'Use semantic tokens instead of hex colors in features.',
        },
      ],
    },
  })),
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: storagePaths,
          patterns: [
            relativePattern,
            { group: ['@/features/*/**'], message: 'Use the public feature entry point.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': importRule(['@/features', '@/app', '@/providers']) },
  },
  {
    files: ['src/providers/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': importRule(['@/features', '@/app']) },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    ignores: ['src/lib/storage/**'],
    rules: {
      'no-restricted-imports': importRule(['@/features', '@/components', '@/app', '@/providers']),
    },
  },
  {
    files: ['src/lib/storage/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': importRule(
        ['@/features', '@/components', '@/app', '@/providers'],
        true
      ),
    },
  },
  {
    files: ['src/lib/api/**/*.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', ...runtimeGlobals],
      'no-restricted-properties': ['error', ...restrictedProperties],
    },
  },
]);

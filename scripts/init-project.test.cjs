const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { run } = require('./init-project.cjs');

function snapshot(root) {
  const files = {};
  function visit(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.isSymbolicLink()) continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) visit(file);
      else files[path.relative(root, file)] = fs.readFileSync(file).toString('base64');
    }
  }
  visit(root);
  return files;
}

describe('scripts/init-project.cjs', () => {
  const repoRoot = path.join(__dirname, '..');
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-core-base-test-'));
    // Copy all files except git and node_modules
    const entries = fs.readdirSync(repoRoot);
    for (const entry of entries) {
      if (['.git', 'node_modules', '.expo', 'android', 'ios', '.idea'].includes(entry)) continue;
      const src = path.join(repoRoot, entry);
      const dst = path.join(tempDir, entry);
      fs.cpSync(src, dst, { recursive: true });
    }
    // Symlink node_modules for typecheck
    fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(tempDir, 'node_modules'), 'dir');
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('--dry-run reports actions without modifying files', () => {
    const before = snapshot(tempDir);
    const authExisted = fs.existsSync(path.join(tempDir, 'src/features/auth'));
    const originalAppConfig = fs.readFileSync(path.join(tempDir, 'app.config.ts'), 'utf8');
    const actions = run([
      '--root',
      tempDir,
      '--name',
      'Acme App',
      '--slug',
      'acme-app',
      '--bundle-id',
      'com.acme.app',
      '--scheme',
      'acmeapp',
      '--clean-samples',
      '--dry-run',
    ]);

    expect(actions.length).toBeGreaterThan(0);
    expect(snapshot(tempDir)).toEqual(before);
    const afterAppConfig = fs.readFileSync(path.join(tempDir, 'app.config.ts'), 'utf8');
    expect(afterAppConfig).toBe(originalAppConfig);
    expect(fs.existsSync(path.join(tempDir, 'src/features/auth'))).toBe(authExisted);
  });

  test('applies project rename and clean-samples, passing typecheck', () => {
    // New languages must remain registered with the same keys after sample cleanup.
    const localesDir = path.join(tempDir, 'src/lib/i18n/locales');
    fs.copyFileSync(path.join(localesDir, 'en.json'), path.join(localesDir, 'fr.json'));
    const languagesPath = path.join(tempDir, 'src/lib/i18n/languages.ts');
    fs.writeFileSync(
      languagesPath,
      fs
        .readFileSync(languagesPath, 'utf8')
        .replace(
          "import en from './locales/en.json';",
          "import en from './locales/en.json';\nimport fr from './locales/fr.json';"
        )
        .replace(
          "en: { label: 'English', resources: en },",
          "en: { label: 'English', resources: en },\n  fr: { label: 'Français', resources: fr },"
        )
    );
    run([
      '--root',
      tempDir,
      '--name',
      'Demo App',
      '--slug',
      'demo-app',
      '--bundle-id',
      'com.demo.app',
      '--scheme',
      'demoapp',
      '--clean-samples',
    ]);

    // Check app.config.ts
    const appConfig = fs.readFileSync(path.join(tempDir, 'app.config.ts'), 'utf8');
    expect(appConfig).toContain("const baseBundleId = 'com.demo.app';");
    expect(appConfig).toContain("const baseName = 'Demo App';");
    expect(appConfig).toContain("slug: 'demo-app',");
    expect(appConfig).toContain("scheme: 'demoapp',");

    // Check package.json
    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('demo-app');
    const lock = JSON.parse(fs.readFileSync(path.join(tempDir, 'package-lock.json'), 'utf8'));
    expect(lock.name).toBe('demo-app');
    expect(lock.packages[''].name).toBe('demo-app');

    // Check README.md
    const readme = fs.readFileSync(path.join(tempDir, 'README.md'), 'utf8');
    expect(readme).toContain('# Demo App');
    expect(readme).toContain('**URL Scheme**: `demoapp`');
    expect(readme).toContain('**Demo App** (`com.demo.app`)');

    // Check deleted samples
    expect(fs.existsSync(path.join(tempDir, 'src/features/auth'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/features/home'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/app/(auth)'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/lib/auth/me-query.ts'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/features/ui-catalog'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/app/(app)/ui-catalog.tsx'))).toBe(false);
    for (const file of [
      'src/app/(app)/_layout.tsx',
      'src/features/settings/screens/settings-screen.tsx',
    ]) {
      expect(fs.readFileSync(path.join(tempDir, file), 'utf8')).not.toMatch(/ui-catalog/);
    }

    // Check preserved foundations
    expect(fs.existsSync(path.join(tempDir, 'src/lib/api/client.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/lib/auth/session.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/features/settings'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/lib/auth/auth-contract.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/lib/i18n/languages.ts'))).toBe(true);

    // Check cleaned i18n
    for (const locale of ['en', 'vi', 'fr']) {
      const resources = JSON.parse(
        fs.readFileSync(path.join(localesDir, `${locale}.json`), 'utf8')
      );
      expect(resources.auth).toBeUndefined();
      expect(resources.home).toBeUndefined();
      expect(resources.common).toBeDefined();
    }

    // Verify typecheck and lint (unused imports, boundaries) on the cleaned codebase
    expect(() => {
      execFileSync('npx', ['tsc', '--noEmit'], { cwd: tempDir, stdio: 'pipe' });
    }).not.toThrow();
    expect(() => {
      execFileSync('npx', ['eslint', 'src', '--max-warnings', '0'], {
        cwd: tempDir,
        stdio: 'pipe',
      });
    }).not.toThrow();
    // The generated project must retain working boundary checks after deleting samples.
    expect(() =>
      execFileSync(
        'npx',
        [
          'jest',
          '--runInBand',
          '--runTestsByPath',
          'scripts/eslint-boundaries.test.cjs',
          'src/lib/i18n/index.test.ts',
        ],
        { cwd: tempDir, stdio: 'pipe', timeout: 30000 }
      )
    ).not.toThrow();
  });
});

// Naming is an input boundary: valid display names must remain valid TypeScript.
test.each(["Thanh's App", 'The "Core" App', 'A \\ B', 'Dollar $& App'])(
  'escapes display name %s',
  (name) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corebase-name-'));
    try {
      fs.copyFileSync(path.join(__dirname, '../app.config.ts'), path.join(dir, 'app.config.ts'));
      fs.copyFileSync(path.join(__dirname, '../README.md'), path.join(dir, 'README.md'));
      run(['--root', dir, '--name', name, '--bundle-id', 'com.name.app']);
      const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
      expect(readme).toContain(`# ${name}\n`);
      expect(readme).toContain(`**Display Name**: ${name}`);
      expect(readme).toContain(`**${name}** (\`com.name.app\`)`);
      const ts = require('typescript');
      const source = fs.readFileSync(path.join(dir, 'app.config.ts'), 'utf8');
      const result = ts.transpileModule(source, {
        reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      });
      expect(result.diagnostics).toEqual([]);
      const evaluated = { exports: {} };
      new Function('exports', result.outputText)(evaluated.exports);
      expect(evaluated.exports.default.name).toBe(name);
      // A second rename must match whichever quote style the first rename used.
      run(['--root', dir, '--name', 'Renamed']);
      expect(fs.readFileSync(path.join(dir, 'app.config.ts'), 'utf8')).toContain(
        "const baseName = 'Renamed';"
      );
      expect(fs.readFileSync(path.join(dir, 'README.md'), 'utf8')).toContain(
        '**Renamed** (`com.name.app`)'
      );
      run(['--root', dir, '--bundle-id', 'com.renamed.app']);
      expect(fs.readFileSync(path.join(dir, 'README.md'), 'utf8')).toContain(
        '**Renamed** (`com.renamed.app`)'
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
);

test('clean-samples requires catalog markers only while the catalog exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corebase-markers-'));
  try {
    for (const file of [
      'src/app/(app)/_layout.tsx',
      'src/features/settings/screens/settings-screen.tsx',
    ]) {
      fs.mkdirSync(path.join(dir, path.dirname(file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), 'export {};\n');
    }
    // Already cleaned (no catalog): nothing to strip.
    expect(() => run(['--root', dir, '--clean-samples', '--dry-run'])).not.toThrow();
    fs.mkdirSync(path.join(dir, 'src/features/ui-catalog'), { recursive: true });
    expect(() => run(['--root', dir, '--clean-samples'])).toThrow('Missing ui-catalog markers');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test.each([
  ['--name'],
  ['--slug', '--clean-samples'],
  ['--slug', 'INVALID SLUG'],
  ['--bundle-id', 'broken'],
  ['--scheme', 'broken scheme'],
])('rejects invalid arguments %j before writing', (...args) => {
  expect(() => run(args)).toThrow();
});

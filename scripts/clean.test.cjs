const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

describe('scripts/clean.cjs', () => {
  let fixture;
  let external;

  beforeEach(() => {
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'corebase-clean-'));
    external = fs.mkdtempSync(path.join(os.tmpdir(), 'corebase-clean-external-'));
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.copyFileSync(path.join(__dirname, 'clean.cjs'), path.join(fixture, 'scripts/clean.cjs'));
  });

  afterEach(() => {
    fs.rmSync(fixture, { recursive: true, force: true });
    fs.rmSync(external, { recursive: true, force: true });
  });

  function makeFile(root, relativePath) {
    const file = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'fixture');
    return file;
  }

  function runClean() {
    execFileSync(process.execPath, [path.join(fixture, 'scripts/clean.cjs')]);
  }

  test('removes generated root and installed-package artifacts while preserving package assets', () => {
    for (const target of [
      'android',
      'ios',
      '.expo',
      '.kotlin',
      'dist',
      'coverage',
      'node_modules/.cache',
    ]) {
      makeFile(fixture, `${target}/generated.txt`);
    }

    const packages = [
      'node_modules/plain',
      'node_modules/@scope/scoped',
      'node_modules/plain/node_modules/nested',
      'node_modules/@scope/scoped/node_modules/deep',
    ];
    for (const packageDir of packages) {
      for (const target of [
        'android/build',
        'android/.cxx',
        'android/.gradle',
        '.gradle',
        'android/expo-gradle-plugin/.gradle',
        'expo-dev-launcher-gradle-plugin/.gradle',
        'expo-module-gradle-plugin/.gradle',
        'apple/.DerivedData',
        'ios/.DerivedData',
      ]) {
        makeFile(fixture, `${packageDir}/${target}/generated.txt`);
      }
      makeFile(fixture, `${packageDir}/src/index.js`);
      makeFile(fixture, `${packageDir}/lib/build/index.js`);
      makeFile(fixture, `${packageDir}/local-maven-repo/artifact.jar`);
      makeFile(fixture, `${packageDir}/android/src/main/AndroidManifest.xml`);
    }

    runClean();

    for (const target of [
      'android',
      'ios',
      '.expo',
      '.kotlin',
      'dist',
      'coverage',
      'node_modules/.cache',
    ]) {
      expect(fs.existsSync(path.join(fixture, target))).toBe(false);
    }
    for (const packageDir of packages) {
      for (const target of [
        'android/build',
        'android/.cxx',
        'android/.gradle',
        '.gradle',
        'android/expo-gradle-plugin/.gradle',
        'expo-dev-launcher-gradle-plugin/.gradle',
        'expo-module-gradle-plugin/.gradle',
        'apple/.DerivedData',
        'ios/.DerivedData',
      ]) {
        expect(fs.existsSync(path.join(fixture, packageDir, target))).toBe(false);
      }
      for (const kept of [
        'src/index.js',
        'lib/build/index.js',
        'local-maven-repo/artifact.jar',
        'android/src/main/AndroidManifest.xml',
      ]) {
        expect(fs.existsSync(path.join(fixture, packageDir, kept))).toBe(true);
      }
    }
  });

  test('does not follow linked packages and works without node_modules', () => {
    makeFile(external, 'android/build/external.txt');
    fs.mkdirSync(path.join(fixture, 'node_modules'));
    fs.symlinkSync(external, path.join(fixture, 'node_modules/linked-package'), 'dir');

    runClean();

    expect(fs.existsSync(path.join(external, 'android/build/external.txt'))).toBe(true);

    fs.rmSync(path.join(fixture, 'node_modules'), { recursive: true, force: true });
    expect(() => runClean()).not.toThrow();
  });
});

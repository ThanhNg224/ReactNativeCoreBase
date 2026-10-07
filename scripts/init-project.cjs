#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    root: path.join(__dirname, '..'),
    cleanSamples: false,
    dryRun: false,
  };

  const valueOptions = {
    '--name': 'name',
    '--slug': 'slug',
    '--bundle-id': 'bundleId',
    '--scheme': 'scheme',
    '--root': 'root',
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--clean-samples') args.cleanSamples = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (valueOptions[arg]) {
      const value = argv[++i];
      if (!value?.trim() || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      args[valueOptions[arg]] = value;
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (args.name && [...args.name].some((character) => character.charCodeAt(0) < 32))
    throw new Error('Display name must be one line');
  if (args.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug)) throw new Error('Invalid slug');
  if (args.bundleId && !/^[a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(args.bundleId))
    throw new Error('Invalid bundle ID');
  if (args.scheme && !/^[a-z][a-z0-9+.-]*$/.test(args.scheme))
    throw new Error('Invalid URL scheme');

  return args;
}

function stringLiteral(value) {
  const json = JSON.stringify(value);
  // Match the repository's singleQuote convention, choosing double quotes for apostrophes.
  if ((value.match(/'/g)?.length ?? 0) > (value.match(/"/g)?.length ?? 0)) return json;
  return "'" + json.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'") + "'";
}

function updateAppConfig(content, { name, slug, bundleId, scheme }) {
  let result = content;
  if (bundleId)
    result = result.replace(
      /const baseBundleId = (?:'[^']*'|"[^"]*");/,
      () => `const baseBundleId = ${stringLiteral(bundleId)};`
    );
  if (name)
    result = result.replace(
      /const baseName = (?:'(?:\\.|[^'])*'|"(?:\\.|[^"])*");/,
      () => `const baseName = ${stringLiteral(name)};`
    );
  if (slug)
    result = result.replace(/slug: (?:'[^']*'|"[^"]*"),/, () => `slug: ${stringLiteral(slug)},`);
  if (scheme)
    result = result.replace(
      /scheme: (?:'[^']*'|"[^"]*"),/,
      () => `scheme: ${stringLiteral(scheme)},`
    );
  return result;
}

function updatePackageJson(content, { slug }) {
  if (!slug) return content;
  const pkg = JSON.parse(content);
  pkg.name = slug;
  return JSON.stringify(pkg, null, 2) + '\n';
}

function updateReadme(content, { name, bundleId, scheme }) {
  let result = content;
  if (name) {
    result = result.replace(/^#\s+.+$/m, () => `# ${name}`);
    result = result.replace(/- \*\*Display Name\*\*: .+$/m, () => `- **Display Name**: ${name}`);
  }
  if (bundleId) {
    result = result.replace(
      /- \*\*Android Package \/ iOS Bundle ID\*\*: `[^`]+`$/m,
      `- **Android Package / iOS Bundle ID**: \`${bundleId}\``
    );
  }
  if (name && bundleId) {
    result = result.replace(
      /The app(?:lication)? (?:has|follows) (?:a single |one )?identity:? \*\*[^*]+\*\* \(`[^`]+`\)/i,
      () => `The app has one identity: **${name}** (\`${bundleId}\`)`
    );
  }
  if (scheme)
    result = result.replace(
      /- \*\*URL Scheme\*\*: `[^`]+`/m,
      () => `- **URL Scheme**: \`${scheme}\``
    );
  return result;
}

const cleanedRootLayout = `import '@styles';
export { ErrorBoundary } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useResolveClassNames, useUniwind } from 'uniwind';
import { AppProviders } from '@/providers/app-providers';
import { useStartup } from '@/providers/use-startup';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useStartup();
  const { theme } = useUniwind();
  const contentStyle = useResolveClassNames('bg-background');
  return (
    <AppProviders>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {ready ? (
        <Stack screenOptions={{ headerShown: false, contentStyle }}>
          <Stack.Screen name="(app)" />
        </Stack>
      ) : null}
    </AppProviders>
  );
}
`;

const placeholderHomeTab = `import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer>
      <Text>{t('common.home')}</Text>
    </ScreenContainer>
  );
}
`;

function cleanI18nJson(content) {
  const data = JSON.parse(content);
  delete data.auth;
  delete data.home;
  return JSON.stringify(data, null, 2) + '\n';
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const actions = [];

  const appConfigPath = path.join(args.root, 'app.config.ts');
  if (fs.existsSync(appConfigPath)) {
    const original = fs.readFileSync(appConfigPath, 'utf8');
    const updated = updateAppConfig(original, args);
    if (updated !== original) {
      actions.push({ type: 'write', file: appConfigPath, content: updated });
    }
  }

  const packageJsonPath = path.join(args.root, 'package.json');
  if (fs.existsSync(packageJsonPath) && args.slug) {
    const original = fs.readFileSync(packageJsonPath, 'utf8');
    const updated = updatePackageJson(original, args);
    if (updated !== original) {
      actions.push({ type: 'write', file: packageJsonPath, content: updated });
    }
  }

  const lockPath = path.join(args.root, 'package-lock.json');
  if (fs.existsSync(lockPath) && args.slug) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.name = args.slug;
    if (lock.packages?.['']) lock.packages[''].name = args.slug;
    actions.push({ type: 'write', file: lockPath, content: JSON.stringify(lock, null, 2) + '\n' });
  }

  const readmePath = path.join(args.root, 'README.md');
  if (fs.existsSync(readmePath) && (args.name || args.bundleId || args.scheme)) {
    const original = fs.readFileSync(readmePath, 'utf8');
    const updated = updateReadme(original, args);
    if (updated !== original) {
      actions.push({ type: 'write', file: readmePath, content: updated });
    }
  }

  if (args.cleanSamples) {
    const toDelete = [
      path.join(args.root, 'src/features/auth'),
      path.join(args.root, 'src/features/home'),
      path.join(args.root, 'src/app/(auth)'),
      path.join(args.root, 'src/lib/auth/me-query.ts'),
      path.join(args.root, 'src/test/feature-screens.test.tsx'),
      path.join(args.root, 'src/test/app-flow.test.tsx'),
    ];

    for (const target of toDelete) {
      if (fs.existsSync(target)) {
        actions.push({ type: 'delete', file: target });
      }
    }

    const layoutPath = path.join(args.root, 'src/app/_layout.tsx');
    actions.push({ type: 'write', file: layoutPath, content: cleanedRootLayout });

    const homeTabIndexPath = path.join(args.root, 'src/app/(app)/(tabs)/index.tsx');
    actions.push({ type: 'write', file: homeTabIndexPath, content: placeholderHomeTab });

    const locales = ['en.json', 'vi.json'];
    for (const locale of locales) {
      const locPath = path.join(args.root, 'src/lib/i18n/locales', locale);
      if (fs.existsSync(locPath)) {
        const original = fs.readFileSync(locPath, 'utf8');
        const updated = cleanI18nJson(original);
        actions.push({ type: 'write', file: locPath, content: updated });
      }
    }
  }

  if (args.dryRun) {
    console.log(`[dry-run] Planned actions (${actions.length}):`);
    for (const act of actions) {
      console.log(`  ${act.type.toUpperCase()}: ${path.relative(args.root, act.file)}`);
    }
    return actions;
  }

  for (const act of actions) {
    if (act.type === 'delete') {
      fs.rmSync(act.file, { recursive: true, force: true });
    } else if (act.type === 'write') {
      fs.mkdirSync(path.dirname(act.file), { recursive: true });
      fs.writeFileSync(act.file, act.content, 'utf8');
    }
  }

  console.log(`Applied ${actions.length} project initialization updates.`);
  return actions;
}

if (require.main === module) {
  try {
    run();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { run, parseArgs };

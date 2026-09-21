import fs from 'fs';
import path from 'path';

// The public botc-translations repo lags behind Weblate, so we pull the current state from there.
// Usage: node bin/fetch-translations.ts [language ...]   (default: de)
const BASE_URL = 'https://translation.botc.app/api/translations/botc-app';

// Weblate component slug -> directory name used in the botc-translations repo
const COMPONENTS: Record<string, string> = {
  'game-content': 'game',
  'app-interface': 'app',
  'script-tool': 'script',
};

interface Unit {
  context: string;
  target: string[];
  translated: boolean;
}

interface UnitPage {
  count: number;
  next: string | null;
  results: Unit[];
}

interface Tree {
  [key: string]: string | Tree;
}

async function fetchUnits(component: string, language: string): Promise<Unit[]> {
  const units: Unit[] = [];
  let url: string | null = `${BASE_URL}/${component}/${language}/units/?format=json&page_size=1000`;

  while (url) {
    const res: Response = await fetch(url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }

    const page: UnitPage = await res.json();
    units.push(...page.results);
    url = page.next;
  }

  return units;
}

function buildTree(units: Unit[]): Tree {
  const root: Tree = {};

  for (const unit of units) {
    // untranslated (or fuzzy) units have no usable target yet
    if (!unit.translated || !unit.target[0]) {
      continue;
    }

    const keys = unit.context.split('.');
    const last = keys.pop() as string;

    let node = root;
    for (const key of keys) {
      node = (node[key] ??= {}) as Tree;
    }
    node[last] = unit.target[0];
  }

  return sortTree(root);
}

// the upstream files are sorted by key, keep that so diffs stay small
function sortTree(tree: Tree): Tree {
  const sorted: Tree = {};

  for (const key of Object.keys(tree).sort()) {
    const value = tree[key];
    sorted[key] = typeof value === 'string' ? value : sortTree(value);
  }

  return sorted;
}

async function main(): Promise<void> {
  const languages = process.argv.slice(2);
  if (languages.length === 0) {
    languages.push('de');
  }

  for (const language of languages) {
    for (const [component, dir] of Object.entries(COMPONENTS)) {
      const units = await fetchUnits(component, language);
      const tree = buildTree(units);
      const translated = units.filter(unit => unit.translated).length;

      const outputDir = path.join(import.meta.dirname, '..', 'data', 'translations', dir);
      fs.mkdirSync(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, `${language}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2) + '\n');
      console.log(`${component}/${language}: ${translated}/${units.length} translated, saved to ${outputPath}`);
    }
  }
}

main().catch((error) => {
  console.error('Error fetching translations:', error);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';

// The translations are synced from Weblate into the public botc-translations repo.
// Usage: node bin/fetch-translations.ts [language ...]   (default: de)
const BASE_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/main';

// directory names used in the botc-translations repo
const COMPONENTS = ['game', 'app', 'script'];

async function main(): Promise<void> {
  const languages = process.argv.slice(2);
  if (languages.length === 0) {
    languages.push('de');
  }

  for (const language of languages) {
    for (const component of COMPONENTS) {
      const url = `${BASE_URL}/${component}/${language}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} for ${url}`);
      }

      const tree = await res.json();

      const outputDir = path.join(import.meta.dirname, '..', 'data', 'translations', component);
      fs.mkdirSync(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, `${language}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2) + '\n');
      console.log(`${component}/${language}: saved to ${outputPath}`);
    }
  }
}

main().catch((error) => {
  console.error('Error fetching translations:', error);
  process.exit(1);
});

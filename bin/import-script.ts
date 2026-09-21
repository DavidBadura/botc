import fs from 'fs';
import path from 'path';

// Imports a script from botcscripts.com or botcscriptorium.com into data/scripts, named after the script
// (e.g. "A Grimm Chorus" -> a_grimm_chorus.json).
// Usage: node bin/import-script.ts <url> [--force]
//   https://www.botcscripts.com/script/3/11.1.1
//   https://www.botcscriptorium.com/script/extension-cord
const SCRIPTS_DIR = path.join(import.meta.dirname, '..', 'data', 'scripts');

// botcscripts.com answers 403 to the default user agent of node
const HEADERS = { 'User-Agent': 'botc-script-import' };

// Scriptorium is a single page app on top of Supabase. The key is the public (publishable) one that its own frontend ships.
const SCRIPTORIUM_API = 'https://cizakbowsxshqdkjkdav.supabase.co/rest/v1/scripts';
const SCRIPTORIUM_KEY = 'sb_publishable_3tF7O52vXFdUMxGAm3A1vg_GkGEzsMk';

const BOTCSCRIPTS_URL = /^https?:\/\/(?:www\.)?botcscripts\.com\/script\/(\d+)\/([^/?#]+)/;
const SCRIPTORIUM_URL = /^https?:\/\/(?:www\.)?botcscriptorium\.com\/script\/([^/?#]+)/;

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { ...HEADERS, ...headers } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }

  return res.json();
}

async function fetchScript(link: string): Promise<{ script: unknown, fallbackSlug: string }> {
  const botcscripts = link.match(BOTCSCRIPTS_URL);
  if (botcscripts) {
    const [, id, version] = botcscripts;

    return {
      script: await fetchJson(`https://www.botcscripts.com/script/${id}/${version}/download`),
      fallbackSlug: `script_${id}_${slugify(version)}`,
    };
  }

  const scriptorium = link.match(SCRIPTORIUM_URL);
  if (scriptorium) {
    const slug = decodeURIComponent(scriptorium[1]);
    const rows = await fetchJson(
      `${SCRIPTORIUM_API}?slug=eq.${encodeURIComponent(slug)}&select=json`,
      { apikey: SCRIPTORIUM_KEY },
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(`No script with the slug "${slug}" found on botcscriptorium.com`);
    }

    return { script: rows[0].json, fallbackSlug: slugify(slug) };
  }

  throw new Error(
    'Expected a link like https://www.botcscripts.com/script/3/11.1.1 or https://www.botcscriptorium.com/script/extension-cord',
  );
}

function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const link = args.find((arg) => !arg.startsWith('--')) ?? '';

  const { script, fallbackSlug } = await fetchScript(link);
  if (!Array.isArray(script)) {
    throw new Error(`${link} did not return a script`);
  }

  const meta = script.find((entry) => typeof entry === 'object' && entry?.id === '_meta');
  const slug = slugify(meta?.name ?? '') || fallbackSlug;
  const outputPath = path.join(SCRIPTS_DIR, `${slug}.json`);

  if (fs.existsSync(outputPath) && !force) {
    throw new Error(`${outputPath} already exists, use --force to overwrite it`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(script, null, 2) + '\n');

  console.log(`Successfully saved "${meta?.name ?? slug}" to ${outputPath}`);
  console.log(`Open it at /${slug}`);
}

main().catch((error) => {
  console.error('Error importing script:', error.message);
  process.exit(1);
});

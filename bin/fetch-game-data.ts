import fs from 'fs';
import path from 'path';

// Official game data (roles, jinxes, night order and role icons), used to resolve scripts at runtime.
// The icons are stored in public/icons, so the sheets don't depend on GitHub when printing.
// Usage: node bin/fetch-game-data.ts
const BASE_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-release/main/resources/data';
const ICON_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-release/main/resources/characters';
const DATA_DIR = path.join(import.meta.dirname, '..', 'data');
const ICON_DIR = path.join(import.meta.dirname, '..', 'public', 'icons');
const CONCURRENCY = 8;

// these teams have a single icon, all other roles have a good (_g) and an evil (_e) variant
const SINGLE_ICON_TEAMS = ['traveller', 'fabled', 'loric'];

interface Role {
  id: string;
  name: string;
  team: string;
  edition: string;
}

interface JinxSource {
  id: string;
  jinx: { id: string, reason: string }[];
}

interface NightSheet {
  firstNight: string[];
  otherNight: string[];
}

interface Jinx {
  // sorted alphabetically, matches the `jinxes` keys in the game translations (e.g. alchemist-boffin)
  roles: [string, string];
  reason: string;
}

async function fetchJson<T>(file: string): Promise<T> {
  const url = `${BASE_URL}/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }

  return res.json();
}

function save(file: string, data: unknown): string {
  const outputPath = path.join(DATA_DIR, file);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + '\n');

  return outputPath;
}

// runs the tasks with a limited number in parallel
async function runLimited<T>(items: T[], task: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      await task(item);
    }
  });

  await Promise.all(workers);
}

async function fetchRoles(): Promise<Role[]> {
  const source = await fetchJson<Role[]>('roles.json');
  const roles = source
    .map(({ id, name, team }) => ({ id, name, team }))
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Successfully saved ${roles.length} roles to ${save('roles.json', roles)}`);

  return source;
}

async function fetchIcons(roles: Role[]): Promise<void> {
  fs.rmSync(ICON_DIR, { recursive: true, force: true });
  fs.mkdirSync(ICON_DIR, { recursive: true });

  await runLimited(roles, async ({ id, team, edition }) => {
    const name = SINGLE_ICON_TEAMS.includes(team) ? id : `${id}_${team === 'minion' || team === 'demon' ? 'e' : 'g'}`;
    const url = `${ICON_URL}/${edition}/${name}.webp`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }

    fs.writeFileSync(path.join(ICON_DIR, `${id}.webp`), Buffer.from(await res.arrayBuffer()));
  });

  console.log(`Successfully saved ${roles.length} icons to ${ICON_DIR}`);
}

async function fetchJinxes(): Promise<void> {
  const source = await fetchJson<JinxSource[]>('jinxes.json');
  const jinxes: Jinx[] = source
    .flatMap(({ id, jinx }) => jinx.map((other) => ({
      roles: [id, other.id].sort() as [string, string],
      reason: other.reason,
    })))
    .sort((a, b) => a.roles.join('-').localeCompare(b.roles.join('-')));

  console.log(`Successfully saved ${jinxes.length} jinxes to ${save('jinxes.json', jinxes)}`);
}

async function fetchNightSheet(): Promise<void> {
  const { firstNight, otherNight } = await fetchJson<NightSheet>('nightsheet.json');

  console.log(`Successfully saved the night order to ${save('nightsheet.json', { firstNight, otherNight })}`);
}

async function main(): Promise<void> {
  const roles = await fetchRoles();
  await fetchIcons(roles);
  await fetchJinxes();
  await fetchNightSheet();
}

main().catch((error) => {
  console.error('Error fetching game data:', error);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';

// Official game data (roles and jinxes), used to resolve scripts at runtime.
// Usage: node bin/fetch-game-data.ts
const BASE_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-release/main/resources/data';
const DATA_DIR = path.join(import.meta.dirname, '..', 'data');

interface Role {
  id: string;
  name: string;
  team: string;
}

interface JinxSource {
  id: string;
  jinx: { id: string, reason: string }[];
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

async function fetchRoles(): Promise<void> {
  const source = await fetchJson<Role[]>('roles.json');
  const roles = source
    .map(({ id, name, team }) => ({ id, name, team }))
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Successfully saved ${roles.length} roles to ${save('roles.json', roles)}`);
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

async function main(): Promise<void> {
  await fetchRoles();
  await fetchJinxes();
}

main().catch((error) => {
  console.error('Error fetching game data:', error);
  process.exit(1);
});

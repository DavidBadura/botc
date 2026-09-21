import fs from 'fs';
import path from 'path';

// Official role data (English name and team per role), used to resolve scripts at runtime.
// Usage: node bin/fetch-roles.ts
const ROLES_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-release/main/resources/data/roles.json';

interface Role {
  id: string;
  name: string;
  team: string;
}

async function main(): Promise<void> {
  const res = await fetch(ROLES_URL);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${ROLES_URL}`);
  }

  const source: Role[] = await res.json();
  const roles = source
    .map(({ id, name, team }) => ({ id, name, team }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const outputPath = path.join(import.meta.dirname, '..', 'data', 'roles.json');
  fs.writeFileSync(outputPath, JSON.stringify(roles, null, 2) + '\n');
  console.log(`Successfully saved ${roles.length} roles to ${outputPath}`);
}

main().catch((error) => {
  console.error('Error fetching roles:', error);
  process.exit(1);
});

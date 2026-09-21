import fs from 'fs';
import path from 'path';
import type {RawScript} from '@/lib/script';

const SCRIPTS_DIR = path.join(process.cwd(), 'data', 'scripts');

// The file names in data/scripts are the slugs of the scripts, e.g. uncertain_death.json -> /uncertain_death
export function listScripts(): string[] {
    return fs.readdirSync(SCRIPTS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace(/\.json$/, ''))
        .sort();
}

export function loadScript(slug: string): RawScript | undefined {
    // only known slugs are read, so the slug can never point outside of the scripts directory
    if (!listScripts().includes(slug)) {
        return undefined;
    }

    return JSON.parse(fs.readFileSync(path.join(SCRIPTS_DIR, `${slug}.json`), 'utf8'));
}

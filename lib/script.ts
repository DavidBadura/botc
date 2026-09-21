import roles from '@/data/roles.json';
import jinxes from '@/data/jinxes.json';

export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';

export type Meta = {
    id: '_meta',
    name: string,
    author?: string,
}

export type ScriptCharacter = {
    id: string,
    name: string,
    englishName: string,
    team: Team,
    ability: string,
    first?: string,
    other?: string,
}

export type ScriptJinx = {
    characters: [ScriptCharacter, ScriptCharacter],
    text: string,
}

export type Item = ScriptCharacter | Meta;

export type Script = Item[];

// The format of the official script tool: an optional _meta object and the roles as ids,
// either as plain strings or as objects with an id.
type RawEntry = string | { id: string, name?: string, author?: string };

export type RawScript = RawEntry[];

// Translator scoped to the `roles` namespace, e.g. from getTranslations('roles').
export interface RoleTranslator {
    (key: string): string,

    has(key: string): boolean,
}

const rolesById = new Map(roles.map((role) => [role.id, role]));

// Script ids may contain underscores (fortune_teller), the role data and translations don't (fortuneteller).
function normalizeId(id: string): string {
    return id.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveMeta(entry: RawEntry): Meta {
    const raw = typeof entry === 'string' ? undefined : entry;

    return {
        id: '_meta',
        // the script tool names the script after the file, including the extension
        name: (raw?.name ?? 'Unknown').replace(/\.json$/i, ''),
        author: raw?.author,
    };
}

export function findRawMeta(script: RawScript): Meta | undefined {
    const entry = script.find((entry) => typeof entry !== 'string' && entry.id === '_meta');

    return entry ? resolveMeta(entry) : undefined;
}

export function resolveScript(script: RawScript, t: RoleTranslator): Script {
    const result: Script = [];

    for (const entry of script) {
        const id = typeof entry === 'string' ? entry : entry.id;

        if (id === '_meta') {
            result.push(resolveMeta(entry));
            continue;
        }

        const roleId = normalizeId(id);
        const role = rolesById.get(roleId);
        if (!role) {
            console.warn(`Unknown role "${id}" in script, skipping it`);
            continue;
        }

        const text = (field: string): string | undefined =>
            t.has(`${roleId}.${field}`) ? t(`${roleId}.${field}`) : undefined;

        result.push({
            id: roleId,
            name: text('name') ?? role.name,
            englishName: role.name,
            team: role.team as Team,
            ability: text('ability') ?? '',
            first: text('first'),
            other: text('other'),
        });
    }

    return result;
}

// The jinxes between the characters of a script, texts come from the `jinxes` namespace (keys like alchemist-boffin).
export function resolveJinxes(script: Script, t: RoleTranslator): ScriptJinx[] {
    const characters = new Map(script.filter((item): item is ScriptCharacter => item.id !== '_meta').map((c) => [c.id, c]));
    const result: ScriptJinx[] = [];

    for (const jinx of jinxes) {
        const [a, b] = jinx.roles.map((id) => characters.get(id));
        if (!a || !b) {
            continue;
        }

        const key = jinx.roles.join('-');
        result.push({
            characters: [a, b],
            text: t.has(key) ? t(key) : jinx.reason,
        });
    }

    return result;
}

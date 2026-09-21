import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RoleTranslator, Script } from './script';
import { findRawMeta, iconPath, resolveJinxes, resolveScript } from './script';

// Translator over a flat map of keys, like getTranslations('roles') would provide.
function translator(messages: Record<string, string> = {}): RoleTranslator {
    const t = ((key: string) => messages[key] ?? key) as RoleTranslator;
    t.has = (key: string) => key in messages;

    return t;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('resolveScript', () => {
    it('resolves plain ids and objects with an id', () => {
        const script = resolveScript(['washerwoman', {id: 'chef'}], translator());

        expect(script.map((item) => item.id)).toEqual(['washerwoman', 'chef']);
    });

    it('takes team and english name from the role data', () => {
        const [character] = resolveScript(['imp'], translator());

        expect(character).toMatchObject({id: 'imp', team: 'demon', englishName: 'Imp'});
    });

    it('normalizes ids with underscores', () => {
        const [character] = resolveScript(['fortune_teller'], translator());

        expect(character.id).toBe('fortuneteller');
    });

    it('uses the translated texts and falls back to the english name', () => {
        const messages = {'imp.name': 'Teufelchen', 'imp.ability': 'Du tötest.', 'imp.first': 'Nichts.'};
        const script = resolveScript(['imp', 'chef'], translator(messages));

        expect(script[0]).toMatchObject({name: 'Teufelchen', ability: 'Du tötest.', first: 'Nichts.', other: undefined});
        expect(script[1]).toMatchObject({name: 'Chef', ability: ''});
    });

    it('skips unknown roles with a warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const script = resolveScript(['washerwoman', 'doesnotexist'], translator());

        expect(script.map((item) => item.id)).toEqual(['washerwoman']);
        expect(warn).toHaveBeenCalledOnce();
    });

    it('resolves the meta entry and strips the file extension from its name', () => {
        const script = resolveScript([{id: '_meta', name: 'My Script.json', author: 'Me'}, 'imp'], translator());

        expect(script[0]).toEqual({id: '_meta', name: 'My Script', author: 'Me'});
    });
});

describe('findRawMeta', () => {
    it('finds the meta entry', () => {
        expect(findRawMeta(['imp', {id: '_meta', name: 'Test'}])).toEqual({id: '_meta', name: 'Test', author: undefined});
    });

    it('returns undefined without a meta entry', () => {
        expect(findRawMeta(['imp'])).toBeUndefined();
    });
});

describe('resolveJinxes', () => {
    function script(...ids: string[]): Script {
        return resolveScript(ids, translator());
    }

    it('returns the jinxes of characters that are both in the script', () => {
        const jinxes = resolveJinxes(script('alchemist', 'boffin', 'imp'), translator());

        expect(jinxes).toHaveLength(1);
        expect(jinxes[0].characters.map((c) => c.id)).toEqual(['alchemist', 'boffin']);
    });

    it('ignores jinxes where only one character is in the script', () => {
        expect(resolveJinxes(script('alchemist', 'imp'), translator())).toEqual([]);
    });

    it('uses the translated text and falls back to the english reason', () => {
        const translated = resolveJinxes(script('alchemist', 'boffin'), translator({'alchemist-boffin': 'Deutscher Text'}));
        const fallback = resolveJinxes(script('alchemist', 'boffin'), translator());

        expect(translated[0].text).toBe('Deutscher Text');
        expect(fallback[0].text).toMatch(/Boffin/);
    });

    it('does not depend on the order of the script', () => {
        const jinxes = resolveJinxes(script('boffin', 'alchemist'), translator());

        expect(jinxes).toHaveLength(1);
    });
});

describe('iconPath', () => {
    it('points to the downloaded icon', () => {
        expect(iconPath('imp')).toBe('/icons/imp.webp');
    });
});

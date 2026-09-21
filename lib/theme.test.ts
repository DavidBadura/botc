import { describe, expect, it } from 'vitest';
import { getAccentColor, getTheme } from './theme';

describe('getAccentColor', () => {
    it('is stable for the same slug', () => {
        expect(getAccentColor('catfishing').hex()).toBe(getAccentColor('catfishing').hex());
    });

    it('differs between scripts', () => {
        const slugs = ['a_grimm_chorus', 'catfishing', 'extension_cord', 'uncertain_death'];
        const colors = new Set(slugs.map((slug) => getAccentColor(slug).hex()));

        expect(colors.size).toBe(slugs.length);
    });

    it('keeps every derived color dark', () => {
        for (const slug of ['a', 'b', 'catfishing', 'script_3_11_1_1', 'script_3_11_1_2']) {
            expect(getAccentColor(slug).lightness()).toBe(22);
        }
    });

    it('prefers an override', () => {
        expect(getAccentColor('hide_and_seek').hex()).toBe('#1F4D2E');
    });
});

describe('getTheme', () => {
    it('builds the pattern url from the accent color', () => {
        const theme = getTheme('hide_and_seek');

        expect(theme.patternStyle.backgroundImage).toBe('url(/api/1F4D2E/pattern)');
    });
});

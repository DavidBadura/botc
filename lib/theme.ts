import Color, {ColorInstance} from "color";

export type Theme = {
    accentColor: ColorInstance,
    patternStyle: {
        backgroundImage: string,
        backgroundRepeat: string,
        backgroundColor: string,
    },
};

// The pattern is multiplied with the accent color and the text on it is gold, so every color has to be dark
// and not too dull. Only the hue differs between scripts.
const saturation = 55;
const lightness = 22;

// Yellow and olive (hue 40-100) turn into a muddy brown at this lightness, so the hues start behind them.
const hueStart = 100;
const hueRange = 300;

// optional overrides per script slug, every other script gets a color derived from its slug
const scriptColors: Record<string, string> = {
    // already printed with the former default color
    uncertain_death: '#162456',
    hide_and_seek: '#1f4d2e',
};

// FNV-1a, spreads similar slugs (script_3_11_1_1, script_3_11_1_2) far apart
function hash(value: string): number {
    let result = 0x811c9dc5;

    for (let i = 0; i < value.length; i++) {
        result ^= value.charCodeAt(i);
        result = Math.imul(result, 0x01000193) >>> 0;
    }

    return result;
}

export function getAccentColor(slug: string): ColorInstance {
    const override = scriptColors[slug];
    if (override) {
        return Color(override);
    }

    return Color.hsl((hueStart + hash(slug) % hueRange) % 360, saturation, lightness);
}

export function getTheme(slug: string): Theme {
    const accentColor = getAccentColor(slug);

    return {
        accentColor,
        patternStyle: {
            backgroundImage: `url(/api/${accentColor.hex().slice(1)}/pattern)`,
            backgroundRepeat: 'repeat',
            backgroundColor: accentColor.toString(),
        },
    };
}

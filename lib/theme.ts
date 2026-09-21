import Color, {ColorInstance} from "color";

export type Theme = {
    accentColor: ColorInstance,
    patternStyle: {
        backgroundImage: string,
        backgroundRepeat: string,
        backgroundColor: string,
    },
};

const defaultColor = '#162456';

// accent colors per script slug, scripts without an entry use the default
const scriptColors: Record<string, string> = {
    hide_and_seek: '#1f4d2e',
};

export function getTheme(slug: string): Theme {
    const accentColor = Color(scriptColors[slug] ?? defaultColor);

    return {
        accentColor,
        patternStyle: {
            backgroundImage: `url(/api/${accentColor.hex().slice(1)}/pattern)`,
            backgroundRepeat: 'repeat',
            backgroundColor: accentColor.toString(),
        },
    };
}

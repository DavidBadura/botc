import Color, {ColorInstance} from "color";

export const accentColor: ColorInstance = Color('#162456');

export const patternStyle = {
    backgroundImage: `url(/api/${accentColor.hex().slice(1)}/pattern)`,
    backgroundRepeat: 'repeat',
    backgroundColor: accentColor.toString()
};

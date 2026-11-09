/**
 * The playable character is fixed at build time: webpack injects `__CHARACTER__`
 * (see `--env character=<name>` in package.json scripts). The name is also the
 * folder name inside `public/assets/`.
 */
// eslint-disable-next-line no-underscore-dangle
declare const __CHARACTER__: string | undefined;

export interface TextColors {
    background: number;
    text: number;
    textStroke: number;
}

/**
 * Optional "full scene" look: coloured sky, clouds, a sand strip instead of the thin ground line
 * and a bluish tint instead of colour inversion at night.
 */
export interface CharacterTheme {
    day: TextColors;
    night: TextColors;
    /** Per-channel (r, g, b) multiplier applied to the whole world at full night. */
    nightTint: readonly [number, number, number];
    /** Stage y of the ground texture's top edge; the texture then extends down from there. */
    groundTop: number;
    /** Draw drifting pixel clouds behind the world. */
    clouds: boolean;
    /** Colours of the pixel clouds by day / at night. */
    cloudColors: {day: number; night: number};
}

export interface CharacterConfig {
    /**
     * Sprites are dark-on-light (like the original Chrome dino), so at night the
     * whole world has to be colour-inverted to stay visible.
     */
    monochrome: boolean;
    theme?: CharacterTheme;
}

/** Blue sky + clouds + sand strip by day, navy sky + stars + crescent moon by night (used by `wild`). */
const skyTheme: CharacterTheme = {
    day: {background: 0x6ec1e4, text: 0xffffff, textStroke: 0x2a3b5c},
    night: {background: 0x1f2866, text: 0xdfe6ff, textStroke: 0x10153d},
    nightTint: [0.6, 0.52, 0.72],
    groundTop: 358,
    clouds: true,
    cloudColors: {day: 0xffffff, night: 0x6b74b0},
};

export const characters = {
    duck: {monochrome: false},
    dino: {monochrome: true},
    mallard: {monochrome: false},
    wild: {monochrome: false, theme: skyTheme},
} satisfies Record<string, CharacterConfig>;

export type CharacterName = keyof typeof characters;

function resolveCharacter(): CharacterName {
    const name = typeof __CHARACTER__ === "undefined" ? "duck" : __CHARACTER__;

    if (!(name in characters)) {
        throw new Error(`Unknown character "${name}". Known: ${Object.keys(characters).join(", ")}`);
    }

    return name as CharacterName;
}

export const CHARACTER: CharacterName = resolveCharacter();

export const characterConfig: CharacterConfig = characters[CHARACTER];

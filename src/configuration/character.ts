/**
 * The playable character is fixed at build time: webpack injects `__CHARACTER__`
 * (see `--env character=<name>` in package.json scripts). The name is also the
 * folder name inside `public/assets/`.
 */
// eslint-disable-next-line no-underscore-dangle
declare const __CHARACTER__: string | undefined;

export interface CharacterConfig {
    /**
     * Sprites are dark-on-light (like the original Chrome dino), so at night the
     * whole world has to be colour-inverted to stay visible.
     */
    monochrome: boolean;
}

export const characters = {
    duck: {monochrome: false},
    dino: {monochrome: true},
    mallard: {monochrome: false},
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

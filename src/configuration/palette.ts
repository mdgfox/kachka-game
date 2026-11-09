import {characterConfig, TextColors} from "./character";

interface Palette {
    day: TextColors;
    night: TextColors;
    /** Brightness (0..1) of black "line art" (ground, mono sprites) once inverted at night. */
    nightLineBrightness: number;
    star: number;
    moon: number;
    moonCrater: number;
}

const defaultPalette: Palette = {
    day: {
        background: 0xfefefe,
        text: 0x535353,
        textStroke: 0xffffff,
    },
    night: {
        background: 0x202124,
        text: 0xe4e4e4,
        textStroke: 0x202124,
    },
    nightLineBrightness: 0.75,
    star: 0xffffff,
    moon: 0xe8e8e8,
    moonCrater: 0xc4c4c4,
};

const {theme} = characterConfig;

/** The default palette, with the sky / text colours replaced by the character's theme (if any). */
export const palette: Palette = theme
    ? {...defaultPalette, day: theme.day, night: theme.night}
    : defaultPalette;

export function lerpColor(from: number, to: number, t: number): number {
    const channel = (shift: number) => {
        const a = (from >> shift) & 0xff;
        const b = (to >> shift) & 0xff;
        return Math.round(a + (b - a) * t);
    };

    return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

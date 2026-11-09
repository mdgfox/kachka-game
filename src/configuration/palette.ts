export const palette = {
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
    /** Brightness (0..1) of black "line art" (ground, mono sprites) once inverted at night. */
    nightLineBrightness: 0.75,
    star: 0xffffff,
    moon: 0xe8e8e8,
    moonCrater: 0xc4c4c4,
} as const;

export function lerpColor(from: number, to: number, t: number): number {
    const channel = (shift: number) => {
        const a = (from >> shift) & 0xff;
        const b = (to >> shift) & 0xff;
        return Math.round(a + (b - a) * t);
    };

    return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

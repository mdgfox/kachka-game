/**
 * All gameplay tunables in one place.
 * Distances are in pixels, "speed" values are pixels per frame at game speed 1.
 */
export const gameConfig = {
    width: 800,
    height: 400,
    groundY: 360,

    /** How fast the world scrolls to the left (px per frame at speed 1). */
    scrollSpeed: 10,

    scoreCountMultiplier: 0.1,
    /** Every N points the whole game speeds up. */
    achievementStep: 300,
    speedStepMultiplier: 1.2,

    /** Ignore the restart hotkey right after dying so a mashed key does not skip the screen. */
    restartDelayMs: 800,

    player: {
        x: 70,
        animationSpeed: 0.2,
        /** Shrinks the player's collision box on every side to be a bit forgiving. */
        hitboxPadding: 5,
        jump: {
            peakY: 100,
            fallSpeed: 12,
            riseSpeed: 16,
            riseSpeedMid: 12,
            riseSpeedHigh: 8,
            midY: 200,
            highY: 150,
        },
    },

    enemies: {
        spawnX: 850,
        despawnX: -100,
        animationSpeed: 0.2,
        birdChance: 0.5,
        birdMinY: 150,
        birdMaxY: 220,
        /** Spawn timer bounds (timer ticks down by deltaTime * spawnTimerRate). */
        minInterval: 100,
        maxInterval: 500,
        spawnTimerRate: 1.5,
    },

    dayNight: {
        /** The world switches between day and night every N points... */
        halfCycleScore: 400,
        /** ...and fades over this many points. */
        transitionScore: 60,
        starsCount: 28,
        /** Horizontal drift of the sky (stars, moon) in px per frame. */
        skyDriftSpeed: 0.15,
    },
} as const;

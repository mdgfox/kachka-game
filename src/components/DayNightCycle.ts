import {ColorMatrixFilter, Container, IRenderer} from "pixi.js";
import {SkyComponent} from "./SkyComponent";
import {CloudsComponent} from "./CloudsComponent";
import {applyTextColors} from "./interface/textStyles";
import {gameConfig} from "../configuration/gameConfig";
import {lerpColor, palette} from "../configuration/palette";
import {characterConfig} from "../configuration/character";

/**
 * Night factor for a given score: 0 = full day, 1 = full night.
 * The game starts in daylight, then flips every `halfCycleScore` points
 * with a smooth fade of `transitionScore` points.
 */
export function nightFactor(score: number): number {
    const {halfCycleScore, transitionScore} = gameConfig.dayNight;

    const phase = Math.floor(score / halfCycleScore);
    if (phase === 0) {
        return 0;
    }

    const progress = Math.min((score - phase * halfCycleScore) / transitionScore, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const target = phase % 2;

    return target === 1 ? eased : 1 - eased;
}

export class DayNightCycle {
    private readonly renderer: IRenderer;
    private readonly sky: SkyComponent;
    private readonly clouds: CloudsComponent | undefined;
    private readonly invertTargets: Container[];
    private readonly invertFilter = new ColorMatrixFilter();

    private night = -1;

    /**
     * @param invertTargets containers whose pixels get the night colour filter (inversion, or the
     *                      character theme's tint)
     * @param clouds themed characters only: clouds that dim at night
     */
    public constructor(renderer: IRenderer, sky: SkyComponent, invertTargets: Container[], clouds?: CloudsComponent) {
        this.renderer = renderer;
        this.sky = sky;
        this.clouds = clouds;
        this.invertTargets = invertTargets;

        this.apply(0);
    }

    public update(score: number) {
        this.apply(nightFactor(score));
    }

    public reset() {
        this.apply(0);
    }

    private apply(night: number) {
        if (night === this.night) {
            return;
        }
        this.night = night;

        const {day, night: dark} = palette;

        this.renderer.background.color = lerpColor(day.background, dark.background, night);
        applyTextColors(lerpColor(day.text, dark.text, night), lerpColor(day.textStroke, dark.textStroke, night));

        this.sky.setNightFactor(night);
        this.clouds?.setNightFactor(night);

        const tint = characterConfig.theme?.nightTint;
        if (tint) {
            // Coloured sprites keep their colours, they are just dimmed towards the night tint.
            const [r, g, b] = tint.map(channel => 1 + (channel - 1) * night);
            this.invertFilter.matrix = [
                r, 0, 0, 0, 0,
                0, g, 0, 0, 0,
                0, 0, b, 0, 0,
                0, 0, 0, 1, 0,
            ];
        } else {
            // Blend between identity (day) and "negative scaled to nightLineBrightness" (night).
            const line = palette.nightLineBrightness;
            const scale = (1 - night) - night * line;
            const offset = night * line;
            this.invertFilter.matrix = [
                scale, 0, 0, 0, offset,
                0, scale, 0, 0, offset,
                0, 0, scale, 0, offset,
                0, 0, 0, 1, 0,
            ];
        }

        for (const target of this.invertTargets) {
            target.filters = night > 0 ? [this.invertFilter] : null;
        }
    }
}

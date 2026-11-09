import {Container, Graphics} from "pixi.js";
import {gameConfig} from "../configuration/gameConfig";
import {palette} from "../configuration/palette";

/** Stars and a moon that slowly drift to the left. Only visible at night. */
export class SkyComponent extends Container {
    private readonly layer = new Container();
    private offset = 0;

    public constructor() {
        super();

        const stars = this.generateStars();

        // two identical copies side by side so the drift can wrap around seamlessly
        for (const index of [0, 1]) {
            const copy = new Graphics();
            this.drawStars(copy, stars);
            this.drawMoon(copy);
            copy.x = index * gameConfig.width;
            this.layer.addChild(copy);
        }

        this.addChild(this.layer);
        this.setNightFactor(0);
    }

    public setNightFactor(night: number) {
        this.alpha = night;
        this.visible = night > 0;
    }

    public update(deltaTime: number) {
        if (!this.visible) {
            return;
        }

        this.offset = (this.offset + deltaTime * gameConfig.dayNight.skyDriftSpeed) % gameConfig.width;
        this.layer.x = -this.offset;
    }

    private generateStars() {
        return Array.from({length: gameConfig.dayNight.starsCount}, () => ({
            x: Math.floor(Math.random() * gameConfig.width),
            y: Math.floor(Math.random() * (gameConfig.groundY - 140)),
            size: Math.random() < 0.3 ? 4 : 2,
        }));
    }

    private drawStars(graphics: Graphics, stars: {x: number; y: number; size: number}[]) {
        graphics.beginFill(palette.star);
        for (const star of stars) {
            graphics.drawRect(star.x, star.y, star.size, star.size);
        }
        graphics.endFill();
    }

    private drawMoon(graphics: Graphics) {
        const x = 640;
        const y = 70;

        graphics.beginFill(palette.moon).drawCircle(x, y, 18).endFill();
        graphics.beginFill(palette.moonCrater)
            .drawCircle(x - 6, y - 5, 4)
            .drawCircle(x + 7, y + 4, 3)
            .drawCircle(x - 2, y + 9, 2)
            .endFill();
    }
}

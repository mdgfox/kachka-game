import {Sprite, Texture} from "pixi.js";
import {gameConfig} from "../configuration/gameConfig";
import {characterConfig} from "../configuration/character";

export class GroundComponent extends Sprite {
    public constructor(texture: Texture) {
        super(texture);

        // Classic ground is a thin strip whose bottom edge sits on `groundY`. Themed grounds are
        // taller (sand down to the bottom of the screen), so they hang from their top edge instead.
        const top = characterConfig.theme?.groundTop;
        const anchorY = top === undefined ? 1 : 0;

        this.anchor.set(0, anchorY);
        this.position.set(0, top ?? gameConfig.groundY);

        // second copy right after the first one makes the scroll seamless
        const ground = new Sprite(texture);
        ground.anchor.set(0, anchorY);
        ground.position.set(texture.width, 0);
        this.addChild(ground);
    }

    public update(deltaTime: number) {
        this.x = (this.x - deltaTime * gameConfig.scrollSpeed) % this.texture.width;
    }

    public reset() {
        this.x = 0;
    }
}

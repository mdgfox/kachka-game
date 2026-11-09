import {Sprite, Texture} from "pixi.js";
import {gameConfig} from "../configuration/gameConfig";

export class GroundComponent extends Sprite {
    public constructor(texture: Texture) {
        super(texture);

        this.anchor.set(0, 1);
        this.position.set(0, gameConfig.groundY);

        // second copy right after the first one makes the scroll seamless
        const ground = new Sprite(texture);
        ground.anchor.set(0, 1);
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

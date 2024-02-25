import {Assets, Sprite, Texture} from "pixi.js";
import {ease} from "pixi-ease";
import {CommonAssets} from "./assetsConfiguration/types";

export class GroundComponent extends Sprite{
    private constructor(texture: Texture) {
        super(texture);

        this.anchor.set(0, 1);
        this.position.set(0, 200);

        const ground = new Sprite(texture);
        ground.anchor.set(0, 1);
        ground.position.set(texture.width, 0);
        this.addChild(ground)
        const easing = ease.add(this, { x: -texture.width }, { duration: 2000, repeat: true, ease: "linear" });
        easing.on("complete", () => this.position.set(0, 200));
    }

    public static async build(): Promise<GroundComponent> {

        const commonAssets: CommonAssets = await Assets.loadBundle("common");

        return new GroundComponent(commonAssets.ground);
    }
}
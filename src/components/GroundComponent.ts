import { Assets, Sprite, Texture, Ticker } from "pixi.js";
import {CommonAssets} from "../assetsConfiguration/types";

export class GroundComponent extends Sprite{
    private readonly sharedTicker: Ticker;
    private constructor(texture: Texture, ticker: Ticker) {
        super(texture);

        this.sharedTicker = ticker;

        this.anchor.set(0, 1);
        this.position.set(0, 360);

        const ground = new Sprite(texture);
        ground.anchor.set(0, 1);
        ground.position.set(texture.width, 0);
        this.addChild(ground);
        this.sharedTicker.add(this.update, this);
    }

    public static async build(ticker: Ticker): Promise<GroundComponent> {
        const commonAssets: CommonAssets = await Assets.loadBundle("common");

        return new GroundComponent(commonAssets.land, ticker);
    }

    private update(deltaTime: number) {
        const updX = this.position.x - deltaTime * 10;
        this.position.set(updX < -this.texture.width ? 0 : updX, 360);
    }

    public restoreDefault() {
        this.position.set(0, 360);
    }
}

import {AnimatedSprite, IDestroyOptions, Sprite, Ticker} from "pixi.js";
import {Player} from "./Player";
import {BirdAssets} from "../assetsConfiguration/types";

export class Bird extends Sprite {
    private readonly player: Player;
    private readonly sharedTicker: Ticker;

    private readonly animation: AnimatedSprite;
    private readonly flyHeight: number;

    private readonly gameOverCallback: () => void;

    public constructor(assets: BirdAssets, player: Player, y: number = 150, gameOverCallback: () => void, ticker: Ticker) {
        super();

        this.animation = new AnimatedSprite([assets.bird_1, assets.bird_2]);
        this.animation.animationSpeed = 0.2;
        this.animation.play();
        this.addChild(this.animation);
        this.flyHeight = y;

        this.position.set(850, this.flyHeight);
        this.anchor.set(0.5, 1);
        this.player = player;
        this.gameOverCallback = gameOverCallback;

        this.sharedTicker = ticker;
        this.sharedTicker.add(this.update, this);
    }

    private update(deltaTime: number) {
        const updX = this.position.x - deltaTime * 10;
        if(updX < -100) {
            this.destroy();
        } else {
            this.position.set(updX, this.flyHeight);
            // check collision
            if(this.animation.getBounds().intersects(this.player.dinoAnimation.getBounds())) {
                this.gameOverCallback();
            }
        }
    }

    override destroy(_options?: IDestroyOptions | boolean) {
        this.sharedTicker.remove(this.update, this);
        super.destroy(_options);
    }
}
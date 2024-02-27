import {IDestroyOptions, Sprite, Texture, Ticker} from "pixi.js";
import {Player} from "../Player";

export class GroundEnemy extends Sprite {
    private readonly player: Player;
    private readonly sharedTicker: Ticker;

    private readonly gameOverCallback: () => void;

    public constructor(texture: Texture, player: Player, gameOverCallback: () => void, ticker: Ticker) {
        super(texture);
        this.position.set(850, 360);
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
            this.position.set(updX, 360);
            // check collision
            if(this.getBounds().intersects(this.player.dinoAnimation.getBounds())) {
                this.gameOverCallback();
            }
        }
    }

    override destroy(_options?: IDestroyOptions | boolean) {
        this.sharedTicker.remove(this.update, this);
        super.destroy(_options);
    }
}

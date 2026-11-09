import {Rectangle, Sprite, Texture} from "pixi.js";
import {Enemy} from "./Enemy";
import {gameConfig} from "../../configuration/gameConfig";

export class GroundEnemy extends Enemy {
    private readonly sprite: Sprite;

    public constructor(texture: Texture) {
        super();

        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5, 1);
        this.addChild(this.sprite);

        this.position.set(gameConfig.enemies.spawnX, gameConfig.groundY);
    }

    public get hitbox(): Rectangle {
        const {width, height} = this.sprite;

        return new Rectangle(this.x - width / 2, this.y - height, width, height);
    }
}

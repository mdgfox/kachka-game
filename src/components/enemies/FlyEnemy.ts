import {AnimatedSprite, Rectangle} from "pixi.js";
import {Enemy} from "./Enemy";
import {ObstaclesAssets} from "../types";
import {gameConfig} from "../../configuration/gameConfig";

export class FlyEnemy extends Enemy {
    private readonly animation: AnimatedSprite;

    public constructor(assets: ObstaclesAssets, flyHeight: number) {
        super();

        this.animation = new AnimatedSprite([assets.fly_1, assets.fly_2]);
        this.animation.animationSpeed = gameConfig.enemies.animationSpeed;
        this.animation.play();
        this.addChild(this.animation);

        this.position.set(gameConfig.enemies.spawnX, flyHeight);
    }

    /** The bird is drawn from its top-left corner at the enemy position. */
    public get hitbox(): Rectangle {
        const {width, height} = this.animation;

        return new Rectangle(this.x, this.y, width, height);
    }
}

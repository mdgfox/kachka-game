import {Container, Rectangle} from "pixi.js";
import {gameConfig} from "../../configuration/gameConfig";

export abstract class Enemy extends Container {
    /** Collision box in stage coordinates. */
    public abstract get hitbox(): Rectangle;

    /** Moves the enemy with the world. Returns false once it has left the screen. */
    public update(deltaTime: number): boolean {
        this.x -= deltaTime * gameConfig.scrollSpeed;

        return this.x >= gameConfig.enemies.despawnX;
    }
}

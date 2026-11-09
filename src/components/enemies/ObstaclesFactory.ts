import {Container, Rectangle, Texture} from "pixi.js";
import {GroundEnemy} from "./GroundEnemy";
import {FlyEnemy} from "./FlyEnemy";
import {Enemy} from "./Enemy";
import {ObstaclesAssets} from "../types";
import {gameConfig} from "../../configuration/gameConfig";

export class ObstaclesFactory {
    public readonly view = new Container();

    private readonly assets: ObstaclesAssets;
    private readonly groundTextures: Texture[];
    private enemies: Enemy[] = [];
    private nextObstacleInterval: number = 1000;

    public constructor(assets: ObstaclesAssets) {
        this.assets = assets;
        this.groundTextures = [
            assets.ground_big_1,
            assets.ground_big_2,
            assets.ground_big_3,
            assets.ground_small_1,
            assets.ground_small_2,
            assets.ground_small_3,
        ];
    }

    public start() {
        this.nextObstacleInterval = this.randomInterval();
    }

    public reset() {
        for (const enemy of this.enemies) {
            enemy.destroy({children: true});
        }
        this.enemies = [];

        this.start();
    }

    public update(deltaTime: number) {
        this.nextObstacleInterval -= deltaTime * gameConfig.enemies.spawnTimerRate;

        if (this.nextObstacleInterval < 0) {
            this.nextObstacleInterval = this.randomInterval();
            this.spawn();
        }

        this.enemies = this.enemies.filter(enemy => {
            const alive = enemy.update(deltaTime);
            if (!alive) {
                enemy.destroy({children: true});
            }

            return alive;
        });
    }

    public collidesWith(box: Rectangle): boolean {
        return this.enemies.some(enemy => enemy.hitbox.intersects(box));
    }

    private spawn() {
        const {birdChance, birdMinY, birdMaxY} = gameConfig.enemies;

        const enemy = Math.random() < birdChance
            ? new FlyEnemy(this.assets, this.getRandom(birdMinY, birdMaxY))
            : new GroundEnemy(this.groundTextures[this.getRandom(0, this.groundTextures.length - 1)]);

        this.enemies.push(enemy);
        this.view.addChild(enemy);
    }

    private randomInterval() {
        return this.getRandom(gameConfig.enemies.minInterval, gameConfig.enemies.maxInterval);
    }

    private getRandom(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

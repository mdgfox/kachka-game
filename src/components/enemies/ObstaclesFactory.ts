import {Assets, Container, Texture, Ticker} from "pixi.js";
import {GroundEnemy} from "./GroundEnemy";
import {FlyEnemy} from "./FlyEnemy";
import {Player} from "../Player";
import {ObstaclesAssets} from "../types";

export class ObstaclesFactory {
    private readonly assets: ObstaclesAssets;
    private readonly groundAssets: Array<Texture> = [];
    private readonly spawnContainer: Container;
    private readonly minInterval: number;
    private readonly maxInterval: number;

    private nextObstacleInterval: number = 1000;

    private readonly sharedTicker: Ticker;
    private readonly player: Player;
    private readonly gameOverCallback: () => void;

    private constructor(assets: ObstaclesAssets, container: Container, player: Player, ticker: Ticker, gameOverCallback: () => void, min: number = 100, max: number = 500) {
        this.assets = assets;
        this.groundAssets = Object.keys(this.assets)
            .filter(key => !["fly_1", "fly_2"]
            .includes(key))
            .map(key => assets[key as keyof ObstaclesAssets]);
        this.spawnContainer = container;
        this.player = player;
        this.gameOverCallback = gameOverCallback;
        this.minInterval = min;
        this.maxInterval = max;

        this.sharedTicker = ticker;
        this.sharedTicker.add((deltaTime: number) => this.update(deltaTime));
    }

    public static async build(container: Container, player: Player, gameOverCallback: () => void, ticker: Ticker) {
        const assets = await Assets.loadBundle('obstacles');

        return new ObstaclesFactory(assets, container, player, ticker, gameOverCallback);
    }

    start() {
        this.nextObstacleInterval = this.getRandom(this.minInterval, this.maxInterval);
    }
    private update(deltaTime: number) {
        this.nextObstacleInterval -= deltaTime * 1.5;

        if(this.nextObstacleInterval < 0) {
            this.nextObstacleInterval = this.getRandom(this.minInterval, this.maxInterval);
            this.spawn();
        }
    }
    spawn() {
        const obstacleType = this.getRandom(1, 2);
        switch (obstacleType) {
            case 1: {
                const bird = new FlyEnemy(this.assets, this.player, this.getRandom(150, 220), this.gameOverCallback, this.sharedTicker);
                this.spawnContainer.addChild(bird);
                break;
            }
            case 2:
            default: {
                const texture = this.groundAssets[this.getRandom(0, this.groundAssets.length - 1)];
                const obstacle = new GroundEnemy(texture, this.player, this.gameOverCallback, this.sharedTicker);
                this.spawnContainer.addChild(obstacle);
                break;
            }
        }
    }

    private getRandom(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    restoreDefault() {
        for(let i = 0; i < this.spawnContainer.children.length; i++) {
            if(this.spawnContainer.children[i] instanceof GroundEnemy || this.spawnContainer.children[i] instanceof FlyEnemy) {
                this.spawnContainer.children[i].destroy();
            }
        }
        this.start();
    }
}

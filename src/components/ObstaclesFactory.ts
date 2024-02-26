import {BirdAssets, ObstaclesAssets} from "../assetsConfiguration/types";
import {Assets, Container, Ticker} from "pixi.js";
import {Cactus} from "./Cactus";
import {Player} from "./Player";
import {Bird} from "./Bird";

export class ObstaclesFactory {
    private readonly assets: ObstaclesAssets;
    private readonly birdAssets: BirdAssets;
    private readonly spawnContainer: Container;
    private readonly minInterval: number;
    private readonly maxInterval: number;

    private nextObstacleInterval: number = 1000;

    private readonly sharedTicker: Ticker;
    private readonly player: Player;
    private readonly gameOverCallback: () => void;

    private constructor(assets: ObstaclesAssets, birdAssets: BirdAssets, container: Container, player: Player, ticker: Ticker, gameOverCallback: () => void, min: number = 100, max: number = 500) {
        this.assets = assets;
        this.birdAssets = birdAssets;
        this.spawnContainer = container;
        this.player = player;
        this.gameOverCallback = gameOverCallback;
        this.minInterval = min;
        this.maxInterval = max;

        this.sharedTicker = ticker;
        this.sharedTicker.add((deltaTime: number) => this.update(deltaTime));
    }

    public static async build(container: Container, player: Player, gameOverCallback: () => void, ticker: Ticker) {
        const obstaclesAssets = await Assets.loadBundle('obstacles');
        const birdAssets = await Assets.loadBundle("bird");

        return new ObstaclesFactory(obstaclesAssets, birdAssets, container, player, ticker, gameOverCallback);
    }

    start() {
        this.nextObstacleInterval = this.getRandom(this.minInterval, this.maxInterval);
    }
    private update(deltaTime: number) {
        this.nextObstacleInterval -= deltaTime;

        if(this.nextObstacleInterval < 0) {
            this.nextObstacleInterval = this.getRandom(this.minInterval, this.maxInterval);
            this.spawn();
        }
    }
    spawn() {
        const obstacleType = this.getRandom(1, 2);
        switch (obstacleType) {
            case 1: {
                const bird = new Bird(this.birdAssets, this.player, this.getRandom(150, 220), this.gameOverCallback, this.sharedTicker);
                this.spawnContainer.addChild(bird);
                break;
            }
            case 2:
            default: {
                const keys =  Object.keys(this.assets);
                const key = keys[this.getRandom(0, keys.length - 1)];

                const obstacle = new Cactus(this.assets[key as keyof ObstaclesAssets], this.player, this.gameOverCallback, this.sharedTicker);
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
            if(this.spawnContainer.children[i] instanceof Cactus || this.spawnContainer.children[i] instanceof Bird) {
                this.spawnContainer.children[i].destroy();
            }
        }
        this.start();
    }
}
import {AnimatedSprite, Assets, Sprite, Ticker} from "pixi.js";
import { PlayerAssets} from "../assetsConfiguration/types";
import { sound } from "@pixi/sound";

export class Player extends Sprite {
    protected assets: PlayerAssets;

    private characterAnimation: AnimatedSprite;

    public get bounds() {
        return this.characterAnimation.getBounds();
    }

    private set animation(animation: AnimatedSprite) {
        this.removeChild(this.characterAnimation);

        this.characterAnimation = animation;
        this.characterAnimation.animationSpeed = 0.2;
        this.characterAnimation.position.set(70, 360);
        this.characterAnimation.anchor.set(0.5, 1);
        this.characterAnimation.play();
        this.characterAnimation._bounds.pad(-5);

        this.addChild(this.characterAnimation);
    }

    private duckDownProcess: boolean = false;
    private jumpProcess: boolean = false;
    private jumpProcessFall: boolean = false;

    private constructor(assets: PlayerAssets) {
        super();
        this.assets = assets;

        this.characterAnimation = new AnimatedSprite([assets.start]);
        this.characterAnimation.position.set(70, 360);
        this.characterAnimation.anchor.set(0.5, 1);
        this.addChild(this.characterAnimation);

        Ticker.shared.add(this.jumpUpdate, this);
    }

    public static async build(): Promise<Player> {
        const assets = await Assets.loadBundle('player');

        return new Player(assets);
    }

    public start() {
        window.addEventListener("keydown", this.jump.bind(this), false);
        window.addEventListener("keydown", this.duckDown.bind(this), false);
        window.addEventListener("keyup", this.duckUp.bind(this), false);

        this.runAnimation();
    }

    public runAnimation() {
        this.animation = new AnimatedSprite([this.assets.run_1, this.assets.run_2]);
    }

    private duckDownAnimation() {
        this.animation = new AnimatedSprite([this.assets.duck_1, this.assets.duck_2]);
    }

    private jump(event: KeyboardEvent) {
        if((event.code === "Space" || event.code === "ArrowUp") && !this.jumpProcess) {
            this.jumpProcess = true;
            sound.play("jump");
            this.animation = new AnimatedSprite([this.assets.idle_1]);
        }
    }

    private jumpUpdate(dt: number) {
        if(this.jumpProcess) {
            if(this.jumpProcessFall) {
                const newY = this.characterAnimation.position.y + dt * 12;
                if(newY < 360) {
                    this.characterAnimation.position.set(70, newY);
                } else {
                    this.characterAnimation.position.set(70, 360);
                    this.jumpProcess = false;
                    this.jumpProcessFall = false;
                    this.runAnimation();
                }
            } else {
                let speedCoefficient = 16;
                if(this.characterAnimation.position.y < 150) {
                    speedCoefficient = 8;
                } else if(this.characterAnimation.position.y < 200) {
                    speedCoefficient = 12;
                }
                if(this.characterAnimation.position.y - dt * speedCoefficient < 100) {
                    this.characterAnimation.position.set(70, 100);
                    this.jumpProcessFall = true;
                } else {
                    this.characterAnimation.position.set(70, this.characterAnimation.position.y - dt * speedCoefficient);
                }
            }
        }
    }

    private duckDown(event: KeyboardEvent) {
        if(event.code === "ArrowDown" && event.type === "keydown" && !this.duckDownProcess && !this.jumpProcess) {
            this.duckDownProcess = true;
            this.duckDownAnimation();
        }
    }

    private duckUp(event: KeyboardEvent) {
        if(event.code === "ArrowDown" && event.type === "keyup") {
            this.duckDownProcess = false;
            this.runAnimation();
        }
    }
}

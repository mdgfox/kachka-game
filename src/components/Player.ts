import {AnimatedSprite, Container, Rectangle, Texture} from "pixi.js";
import {sound} from "@pixi/sound";
import {PlayerAssets} from "./types";
import {gameConfig} from "../configuration/gameConfig";

export enum PlayerState {
    Idle,
    Running,
    Jumping,
    Ducking,
    Dead,
}

export class Player extends Container {
    private readonly assets: PlayerAssets;
    private readonly sprite: AnimatedSprite;

    private state: PlayerState = PlayerState.Idle;
    private jumpFalling = false;
    private duckHeld = false;

    public constructor(assets: PlayerAssets) {
        super();
        this.assets = assets;

        this.sprite = new AnimatedSprite([assets.start]);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.animationSpeed = gameConfig.player.animationSpeed;
        this.addChild(this.sprite);

        this.resetPosition();
    }

    /** Collision box in stage coordinates. */
    public get hitbox(): Rectangle {
        const pad = gameConfig.player.hitboxPadding;
        const {width, height} = this.sprite;

        return new Rectangle(
            this.sprite.x - width / 2 + pad,
            this.sprite.y - height + pad,
            width - pad * 2,
            height - pad * 2
        );
    }

    public startRunning() {
        this.resetPosition();
        this.run();
    }

    public jump() {
        if (this.state !== PlayerState.Running && this.state !== PlayerState.Ducking) {
            return;
        }

        this.state = PlayerState.Jumping;
        this.jumpFalling = false;
        sound.play("jump");
        this.setAnimation([this.assets.idle_1]);
    }

    /** Duck is held while the key is down; it only takes effect on the ground. */
    public setDuck(held: boolean) {
        this.duckHeld = held;

        if (held && this.state === PlayerState.Running) {
            this.state = PlayerState.Ducking;
            this.setAnimation([this.assets.duck_1, this.assets.duck_2]);
        } else if (!held && this.state === PlayerState.Ducking) {
            this.run();
        }
    }

    public die() {
        this.state = PlayerState.Dead;
        this.sprite.textures = [this.assets.dead];
        this.sprite.stop();
    }

    public update(deltaTime: number) {
        if (this.state !== PlayerState.Jumping) {
            return;
        }

        const {jump} = gameConfig.player;
        const y = this.sprite.y;

        if (this.jumpFalling) {
            const newY = y + deltaTime * jump.fallSpeed;

            if (newY < gameConfig.groundY) {
                this.sprite.y = newY;
            } else {
                this.sprite.y = gameConfig.groundY;
                this.jumpFalling = false;
                this.land();
            }

            return;
        }

        let speed: number = jump.riseSpeed;
        if (y < jump.highY) {
            speed = jump.riseSpeedHigh;
        } else if (y < jump.midY) {
            speed = jump.riseSpeedMid;
        }

        const newY = y - deltaTime * speed;
        if (newY < jump.peakY) {
            this.sprite.y = jump.peakY;
            this.jumpFalling = true;
        } else {
            this.sprite.y = newY;
        }
    }

    private land() {
        if (this.duckHeld) {
            this.state = PlayerState.Ducking;
            this.setAnimation([this.assets.duck_1, this.assets.duck_2]);
        } else {
            this.run();
        }
    }

    private run() {
        this.state = PlayerState.Running;
        this.setAnimation([this.assets.run_1, this.assets.run_2]);
    }

    private resetPosition() {
        this.sprite.position.set(gameConfig.player.x, gameConfig.groundY);
    }

    private setAnimation(textures: Texture[]) {
        this.sprite.textures = textures;
        this.sprite.play();
    }
}

import {AnimatedSprite, Assets, Sprite} from "pixi.js";
import {CommonAssets, DeadAssets, DuckAssets, IdleAssets, RunAssets} from "../assetsConfiguration/types";
import { sound } from "@pixi/sound";
import { ease } from "pixi-ease";

export class Player extends Sprite {
    protected deadAssets: DeadAssets;
    protected duckAssets: DuckAssets;
    protected idleAssets: IdleAssets;
    protected runAssets: RunAssets;
    protected commonAssets: CommonAssets;

    public dinoAnimation: AnimatedSprite;

    private duckDownProcess: boolean = false;
    private jumpProcess: boolean = false;

    private constructor(
        assets: {deadAssets: DeadAssets, duckAssets: DuckAssets, idleAssets: IdleAssets, runAssets: RunAssets, commonAssets: CommonAssets}) {
        super();
        const {deadAssets, duckAssets, idleAssets, runAssets, commonAssets} = assets;
        this.deadAssets = deadAssets;
        this.duckAssets = duckAssets;
        this.idleAssets = idleAssets;
        this.runAssets = runAssets;
        this.commonAssets = commonAssets;

        this.dinoAnimation = new AnimatedSprite([commonAssets.start]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();
        this.addChild(this.dinoAnimation);
        this._bounds.pad(-5);
    }

    public static async build(): Promise<Player> {
        const deadAssets = await Assets.loadBundle('dead');
        const duckAssets = await Assets.loadBundle('duck');
        const idleAssets = await Assets.loadBundle('idle');
        const runAssets = await Assets.loadBundle('run');
        const commonAssets = await Assets.loadBundle('common');

        sound.add('jump', 'public/assets/sounds/jump.wav');

        return new Player({deadAssets, duckAssets, idleAssets, runAssets, commonAssets});
    }

    public start() {
        window.addEventListener("keydown", this.jump.bind(this), false);
        window.addEventListener("keydown", this.duckDown.bind(this), false);
        window.addEventListener("keyup", this.duckUp.bind(this), false);

        this.runAnimation();
    }

    public runAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.runAssets.run_1, this.runAssets.run_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation)
    }

    private duckDownAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.duckAssets.duck_1, this.duckAssets.duck_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation);
    }

    private jump(event: KeyboardEvent) {
        if((event.code === "Space" || event.code === "ArrowUp") && !this.jumpProcess) {
            this.jumpProcess = true;
            sound.play("jump");
            this.removeChild(this.dinoAnimation);
            this.dinoAnimation = new AnimatedSprite([this.idleAssets.idle_1]);
            this.dinoAnimation.position.set(70, 360);
            this.dinoAnimation.anchor.set(0.5, 1);
            this.addChild(this.dinoAnimation);
            const easing = ease.add(this.dinoAnimation, { y: 100}, { duration: 300, reverse: true, ease: "easeOutSine" });
            easing.once("complete", () => {
                this.runAnimation();
                this.jumpProcess = false;
            });
        }
    }

    private duckDown(event: KeyboardEvent) {
        if(event.code === "ArrowDown" && event.type === "keydown" && !this.duckDownProcess) {
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

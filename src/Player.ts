import {AnimatedSprite, Assets, Container} from "pixi.js";
import {DeadAssets, DuckAssets, IdleAssets, RunAssets } from "./assetsConfiguration/types";
import { ease } from "pixi-ease";

export class Player extends Container {
    protected deadAssets: DeadAssets;
    protected duckAssets: DuckAssets;
    protected idleAssets: IdleAssets;
    protected runAssets: RunAssets;

    private dinoAnimation: AnimatedSprite;

    private duckDownProcess: boolean = false;

    private constructor(assets: {deadAssets: DeadAssets, duckAssets: DuckAssets, idleAssets: IdleAssets, runAssets: RunAssets}) {
        super();
        const {deadAssets, duckAssets, idleAssets, runAssets} = assets;
        this.deadAssets = deadAssets;
        this.duckAssets = duckAssets;
        this.idleAssets = idleAssets;
        this.runAssets = runAssets;

        this.dinoAnimation = new AnimatedSprite([idleAssets.idle_1, idleAssets.idle_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 180);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();
        this.addChild(this.dinoAnimation);

        window.addEventListener("keydown", this.jump.bind(this), false);
        window.addEventListener("keydown", this.duckDown.bind(this), false);
        window.addEventListener("keyup", this.duckUp.bind(this), false);

    }

    public static async build(): Promise<Player> {
        const deadAssets = await Assets.loadBundle('dead');
        const duckAssets = await Assets.loadBundle('duck');
        const idleAssets = await Assets.loadBundle('idle');
        const runAssets = await Assets.loadBundle('run');

        return new Player({deadAssets, duckAssets, idleAssets, runAssets});
    }

    private runAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.runAssets.run_1, this.runAssets.run_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 180);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation)
    }

    private duckDownAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.duckAssets.duck_1, this.duckAssets.duck_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 180);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation);
    }

    private run() {
        this.runAnimation();

    }
    private jump(event: KeyboardEvent) {
        if(event.code === "Space" || event.code === "ArrowUp") {
            this.removeChild(this.dinoAnimation);
            this.dinoAnimation = new AnimatedSprite([this.idleAssets.idle_1]);
            this.dinoAnimation.position.set(70, 180);
            this.dinoAnimation.anchor.set(0.5, 1);
            this.addChild(this.dinoAnimation);
            const easing = ease.add(this.dinoAnimation, { y: 100}, { duration: 200, reverse: true, ease: "easeInOutSine" });
            easing.once("complete", () => this.run());
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

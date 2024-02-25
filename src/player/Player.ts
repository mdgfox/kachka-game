import {AnimatedSprite, Assets, Container} from "pixi.js";
import {playerResourcesManifest} from "./assetsManifest";
import {DeadAssets, DuckAssets, IdleAssets, RunAssets } from "./types";

export class Player extends Container {

    protected deadAssets: DeadAssets;
    protected duckAssets: DuckAssets;
    protected idleAssets: IdleAssets;
    protected runAssets: RunAssets;

    private dinoAnimation: AnimatedSprite;

    private constructor(assets: {deadAssets: DeadAssets, duckAssets: DuckAssets, idleAssets: IdleAssets, runAssets: RunAssets}) {
        super();
        const {deadAssets, duckAssets, idleAssets, runAssets} = assets;
        this.deadAssets = deadAssets;
        this.duckAssets = duckAssets;
        this.idleAssets = idleAssets;
        this.runAssets = runAssets;

        this.dinoAnimation = new AnimatedSprite([idleAssets.idle_1, idleAssets.idle_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(100, 100);
        this.dinoAnimation.anchor.set(0.5);
        this.dinoAnimation.play();
        this.addChild(this.dinoAnimation);

        window.addEventListener("keydown", this.jump.bind(this), false);
        window.addEventListener("keydown", this.duckDown.bind(this), false);
    }

    public static async build(): Promise<Player> {
        await Assets.init({ manifest: playerResourcesManifest });

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
        this.dinoAnimation.position.set(100, 100);
        this.dinoAnimation.anchor.set(0.5);
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation)
    }

    private duckDownAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([
            this.duckAssets.duck_1, this.duckAssets.duck_2,
            this.duckAssets.duck_1, this.duckAssets.duck_2,
            this.duckAssets.duck_1, this.duckAssets.duck_2,
        ]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(100, 100);
        this.dinoAnimation.anchor.set(0.5);
        this.dinoAnimation.loop = false;
        this.dinoAnimation.onComplete = () => {
            this.runAnimation();
        };
        this.dinoAnimation.play();

        this.addChild(this.dinoAnimation);
    }

    private jump(event: KeyboardEvent) {
        console.log(event.code === "Space");
        this.runAnimation();
    }

    private duckDown(event: KeyboardEvent) {
        console.log(event.code === "KeyS");
        if(event.code === "KeyS") {
            this.duckDownAnimation();
        }
    }
}

import { AnimatedSprite, Assets, Sprite } from "pixi.js";
import { PlayerAssets} from "../assetsConfiguration/types";
import { sound } from "@pixi/sound";
import { ease } from "pixi-ease";

export class Player extends Sprite {
    protected assets: PlayerAssets;

    public dinoAnimation: AnimatedSprite;

    private duckDownProcess: boolean = false;
    private jumpProcess: boolean = false;

    private constructor(assets: PlayerAssets) {
        super();
        this.assets = assets;

        this.dinoAnimation = new AnimatedSprite([assets.start]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();
        this.dinoAnimation._bounds.pad(-5);
        this.addChild(this.dinoAnimation);
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
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.assets.run_1, this.assets.run_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();
        this.dinoAnimation._bounds.pad(-5);

        this.addChild(this.dinoAnimation);
    }

    private duckDownAnimation() {
        this.removeChild(this.dinoAnimation);

        this.dinoAnimation = new AnimatedSprite([this.assets.duck_1, this.assets.duck_2]);
        this.dinoAnimation.animationSpeed = 0.2;
        this.dinoAnimation.position.set(70, 360);
        this.dinoAnimation.anchor.set(0.5, 1);
        this.dinoAnimation.play();
        this.dinoAnimation._bounds.pad(-5);

        this.addChild(this.dinoAnimation);
    }

    private jump(event: KeyboardEvent) {
        if((event.code === "Space" || event.code === "ArrowUp") && !this.jumpProcess) {
            this.jumpProcess = true;
            sound.play("jump");
            this.removeChild(this.dinoAnimation);
            this.dinoAnimation = new AnimatedSprite([this.assets.idle_1]);
            this.dinoAnimation.position.set(70, 360);
            this.dinoAnimation.anchor.set(0.5, 1);
            this.dinoAnimation._bounds.pad(-5);

            this.addChild(this.dinoAnimation);
            const easing = ease.add(this.dinoAnimation, { y: 100}, { duration: 300, reverse: true, ease: "easeOutSine" });
            easing.once("complete", () => {
                this.runAnimation();
                this.jumpProcess = false;
            });
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

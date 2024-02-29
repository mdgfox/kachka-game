import {Assets, Container, IDestroyOptions, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {sound} from "@pixi/sound";
import {Game} from "../Game";
import {CommonAssets} from "../types";

export class GameOverComponent extends Container {
    private readonly buttonTexture: Texture;
    private readonly textStyles: TextStyle = new TextStyle({
        fontFamily: 'PixelifySans',
        stroke: "white",
        strokeThickness: 5,
        fill:"#535353",
        fontSize: 50
    });

    private readonly restartCallback: () => void;
    private readonly restartGameHotKeySignature: (event: KeyboardEvent) => void;
    private constructor(assets: CommonAssets, restartCallback: () => void) {
        super();

        const text = new Text('Game Over', this.textStyles);
        text.anchor.set(0.5, 0.5);
        this.addChild(text);

        this.buttonTexture = assets.button;
        const buttonView = new Sprite(this.buttonTexture);
        buttonView.eventMode = 'static';
        buttonView.anchor.set(0.5, 0.5);
        buttonView.position.set(0, 70);

        this.restartCallback = restartCallback;
        buttonView.on("pointerdown", this.restartCallback, this);
        this.restartGameHotKeySignature = this.restartGameHotKey.bind(this);
        setTimeout(() => {
            window.addEventListener("keyup", this.restartGameHotKeySignature, false);
        }, 800);
        this.addChild(buttonView);

        this.position.set(Game.WIDTH / 2, Game.HEIGHT / 2 - 50);

        sound.play("gameOver");
    }

    public static async build(restartGameCallback: () => void): Promise<GameOverComponent> {
        const assets: CommonAssets = await Assets.loadBundle("common");

        return new GameOverComponent(assets, restartGameCallback);
    }

    private restartGameHotKey(event: KeyboardEvent) {
        if(event.code === "Space" || event.code === "ArrowUp") {
            this.restartCallback();
        }
    }

    override destroy(_options?: IDestroyOptions | boolean) {
        window.removeEventListener("keyup", this.restartGameHotKeySignature, false);
        super.destroy(_options);
    }
}

import {Assets, Container, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {UIAssets} from "./assetsConfiguration/types";

export class GameOverComponent extends Container {
    private readonly buttonTexture: Texture;
    private constructor(uiAssets: UIAssets) {
        super();

        const text = new Text('Game Over', new TextStyle({ fontFamily: 'PixelifySans', stroke: "white", strokeThickness: 5, fill:"#535353", fontSize: 50 }));
        text.anchor.set(0.5, 0.5);
        this.addChild(text);

        this.buttonTexture = uiAssets.restartButton;
        const buttonView = new Sprite(this.buttonTexture);
        buttonView.eventMode = 'static';
        buttonView.anchor.set(0.5, 0.5);
        buttonView.position.set(0, 70);

        buttonView.on("pointerdown", (_event) => {
            console.log("need restart game");
        });
        this.addChild(buttonView);

        this.position.set(350, 80);
    }

    public static async build(): Promise<GameOverComponent> {

        const uiAssets: UIAssets = await Assets.loadBundle("ui");

        return new GameOverComponent(uiAssets);
    }

}
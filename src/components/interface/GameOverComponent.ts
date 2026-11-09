import {Container, Sprite, Text} from "pixi.js";
import {CommonAssets} from "../types";
import {gameConfig} from "../../configuration/gameConfig";
import {titleTextStyle} from "./textStyles";

export class GameOverComponent extends Container {
    public constructor(assets: CommonAssets, restartCallback: () => void) {
        super();

        const text = new Text("Game Over", titleTextStyle);
        text.anchor.set(0.5, 0.5);
        this.addChild(text);

        const button = new Sprite(assets.button);
        button.eventMode = "static";
        button.cursor = "pointer";
        button.anchor.set(0.5, 0.5);
        button.position.set(0, 70);
        button.on("pointerdown", restartCallback);
        this.addChild(button);

        this.position.set(gameConfig.width / 2, gameConfig.height / 2 - 50);
    }
}

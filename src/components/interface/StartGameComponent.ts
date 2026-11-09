import {Container, Text} from "pixi.js";
import {scoreTextStyle} from "./textStyles";

export class StartGameComponent extends Container {
    public constructor() {
        super();

        const text = new Text("Press space to play", scoreTextStyle);
        text.anchor.set(0, 0);
        text.position.set(20, 0);
        this.addChild(text);
    }
}

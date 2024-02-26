import {Container, Text, TextStyle} from "pixi.js";

export class StartGameComponent extends Container {
    private readonly textComponent: Text;

    private textComponentStyles = new TextStyle({
        fontFamily: 'PixelifySans',
        stroke: "white",
        strokeThickness: 5,
        fill:"#535353",
        fontSize: 30
    });
    constructor() {
        super();
        this.textComponent = new Text("Press space to play", this.textComponentStyles);
        this.textComponent.anchor.set(0, 0);
        this.textComponent.position.set(20, 0);

        this.addChild(this.textComponent);
    }
}
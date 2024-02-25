import {Application} from "pixi.js";
import {Player} from "./player/Player";

export class Game extends Application {
    public static WIDTH = 650;
    public static HEIGHT = 250;

    public constructor() {
        super(
            {
                backgroundColor: "#1099bb",
                backgroundAlpha: 1.0,
                width: Game.WIDTH,
                height: Game.HEIGHT,
                antialias: true
            }
        );
    }

    public async launch() {

        const player = await Player.build();
        this.stage.addChild(player);
    }
}
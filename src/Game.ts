import {Application, Assets} from "pixi.js";
import {GameOverComponent} from "./GameOverComponent";
import {playerResourcesManifest} from "./assetsConfiguration/assetsManifest";
import {GroundComponent} from "./GroundComponent";
import {Player} from "./Player";

export class Game extends Application {
    public static WIDTH = 800;
    public static HEIGHT = 200;

    public constructor() {
        super(
            {
                backgroundColor: "#202124",
                backgroundAlpha: 1.0,
                width: Game.WIDTH,
                height: Game.HEIGHT,
                antialias: true
            }
        );
    }

    public async launch() {
        Assets.addBundle('fonts', {
            "Pixelify": '/public/PixelifySans.ttf',
        });

        await Assets.init({ manifest: playerResourcesManifest });

        await Assets.loadBundle("fonts");

        const gameOver = await GameOverComponent.build();
        this.stage.addChild(gameOver);

        const ground =  await GroundComponent.build();
        this.stage.addChild(ground);

        const player = await Player.build();
        this.stage.addChild(player);

    }
}
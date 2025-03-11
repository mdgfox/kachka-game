import {Application, Assets, Ticker} from "pixi.js";
import {GroundComponent} from "./GroundComponent";
import {Player} from "./Player";
import {gameResourcesManifest} from "../configuration/assetsManifest";
import {sound} from "@pixi/sound";
import {StartGameComponent} from "./interface/StartGameComponent";
import {ScoreComponent} from "./interface/ScoreComponent";
import {GameOverComponent} from "./interface/GameOverComponent";
import {ObstaclesFactory} from "./enemies/ObstaclesFactory";

export class Game extends Application {
    public static WIDTH = 800;
    public static HEIGHT = 400;

    public startGameComponent: StartGameComponent | undefined;
    public scoreComponent: ScoreComponent | undefined;
    public gameOverComponent: GameOverComponent | undefined;
    public groundComponent: GroundComponent | undefined;
    public player: Player | undefined;
    public obstaclesFactory: ObstaclesFactory | undefined;

    private startGameSignature: ((event: KeyboardEvent) => Promise<void>) | undefined;

    private readonly sharedTicker: Ticker;

    public constructor() {
        super(
            {
                backgroundColor: "#fefefe",
                backgroundAlpha: 1.0,
                width: Game.WIDTH,
                height: Game.HEIGHT,
                antialias: true
            }
        );

        this.sharedTicker = Ticker.shared;
        this.sharedTicker.autoStart = false;
        this.sharedTicker.stop();
    }


    public async launch(character: 'dino' | 'duck') {
        await this.loadAssets(character);

        this.startGameComponent = new StartGameComponent();
        this.stage.addChild(this.startGameComponent);

        this.player = await Player.build();
        this.stage.addChild(this.player);

        this.obstaclesFactory = await ObstaclesFactory.build(this.stage, this.player,() => this.endGame(), this.sharedTicker);

        this.startGameSignature = (e) => this.startGame(e);

        window.addEventListener("keydown", this.startGameSignature, false);
    }

    private async loadAssets(character: 'dino' | 'duck') {
        Assets.addBundle('fonts', {"Pixelify": './public/assets/PixelifySans.ttf'});

        await Assets.init({ manifest: gameResourcesManifest(character) });

        await Assets.loadBundle("fonts");

        this.loadSounds();
    }

    private loadSounds() {
        sound.add({
            "jump": "public/assets/sounds/jump.wav",
            "gameOver": "public/assets/sounds/gameOver.wav",
            "achievement": "public/assets/sounds/achievement.wav"
        });
    }

    async startGame(event: KeyboardEvent) {
        if(event.code === "Space" || event.code === "ArrowUp") {
            this.scoreComponent = new ScoreComponent(this.sharedTicker);
            this.stage.addChild(this.scoreComponent);

            this.groundComponent = await GroundComponent.build(this.sharedTicker);
            this.stage.addChild(this.groundComponent);

            if(this.startGameComponent) {
                this.stage.removeChild(this.startGameComponent);
            }

            this.sharedTicker.start();

            this.player?.start();

            this.obstaclesFactory?.start();

            this.stage.setChildIndex(this.groundComponent, 0);

            window.removeEventListener("keydown", this.startGameSignature!, false);
        }
    }

    async endGame() {
        this.sharedTicker.stop();

        this.gameOverComponent = await GameOverComponent.build(this.restartGame.bind(this));
        this.stage.addChild(this.gameOverComponent);

        this.scoreComponent?.writeLocalStorage();
    }

    async restartGame() {
        this.player?.runAnimation();

        if(this.gameOverComponent) {
            this.gameOverComponent.destroy();
        }

        this.scoreComponent?.restoreDefault();

        this.groundComponent?.restoreDefault();

        this.obstaclesFactory?.restoreDefault();

        this.player?.start();

        this.sharedTicker.speed = 1;
        this.sharedTicker.start();
    }
}

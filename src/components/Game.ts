import {Application, Assets, Container, Ticker} from "pixi.js";
import {sound} from "@pixi/sound";
import {GroundComponent} from "./GroundComponent";
import {Player} from "./Player";
import {SkyComponent} from "./SkyComponent";
import {CloudsComponent} from "./CloudsComponent";
import {DayNightCycle} from "./DayNightCycle";
import {StartGameComponent} from "./interface/StartGameComponent";
import {ScoreComponent} from "./interface/ScoreComponent";
import {GameOverComponent} from "./interface/GameOverComponent";
import {ObstaclesFactory} from "./enemies/ObstaclesFactory";
import {CommonAssets, ObstaclesAssets, PlayerAssets} from "./types";
import {gameResourcesManifest} from "../configuration/assetsManifest";
import {CHARACTER, characterConfig, CharacterName} from "../configuration/character";
import {gameConfig} from "../configuration/gameConfig";
import {palette} from "../configuration/palette";

export enum GameState {
    Loading,
    Ready,
    Running,
    GameOver,
}

const JUMP_KEYS = ["Space", "ArrowUp"];

export class Game extends Application {
    private state: GameState = GameState.Loading;
    private gameOverAt = 0;

    /**
     * The shared ticker drives the game simulation. It is stopped on game over
     * (which also freezes every AnimatedSprite) while the application's own
     * ticker keeps rendering. Its `speed` grows as the score does.
     */
    private readonly gameTicker: Ticker = Ticker.shared;

    private sky!: SkyComponent;
    private clouds: CloudsComponent | undefined;
    private world!: Container;
    private ground!: GroundComponent;
    private obstacles!: ObstaclesFactory;
    private player!: Player;
    private dayNight!: DayNightCycle;

    private ui!: Container;
    private startGameComponent!: StartGameComponent;
    private scoreComponent!: ScoreComponent;
    private gameOverComponent: GameOverComponent | undefined;

    private commonAssets!: CommonAssets;

    public constructor() {
        super({
            backgroundColor: palette.day.background,
            backgroundAlpha: 1.0,
            width: gameConfig.width,
            height: gameConfig.height,
            antialias: true,
        });

        this.gameTicker.autoStart = false;
        this.gameTicker.stop();
    }

    public async launch(character: CharacterName = CHARACTER) {
        await this.loadAssets(character);
        this.buildScene(
            await Assets.loadBundle("player") as PlayerAssets,
            await Assets.loadBundle("obstacles") as ObstaclesAssets,
            await Assets.loadBundle("common") as CommonAssets
        );

        this.gameTicker.add(this.update, this);
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);

        this.state = GameState.Ready;
    }

    private async loadAssets(character: CharacterName) {
        Assets.addBundle("fonts", {Pixelify: "./public/assets/PixelifySans.ttf"});

        await Assets.init({manifest: gameResourcesManifest(character)});
        await Assets.loadBundle("fonts");

        sound.add({
            jump: "public/assets/sounds/jump.wav",
            gameOver: "public/assets/sounds/gameOver.wav",
            achievement: "public/assets/sounds/achievement.wav",
        });
    }

    private buildScene(playerAssets: PlayerAssets, obstaclesAssets: ObstaclesAssets, commonAssets: CommonAssets) {
        this.commonAssets = commonAssets;

        this.sky = new SkyComponent();
        const {theme} = characterConfig;
        this.clouds = theme?.clouds ? new CloudsComponent(theme.cloudColors.day, theme.cloudColors.night) : undefined;
        this.ground = new GroundComponent(commonAssets.land);
        this.obstacles = new ObstaclesFactory(obstaclesAssets);
        this.player = new Player(playerAssets);

        this.world = new Container();
        this.world.addChild(this.ground, this.obstacles.view, this.player);

        this.startGameComponent = new StartGameComponent();
        this.scoreComponent = new ScoreComponent();
        this.scoreComponent.visible = false;

        this.ui = new Container();
        this.ui.addChild(this.startGameComponent, this.scoreComponent);

        this.stage.addChild(this.sky);
        if (this.clouds) {
            this.stage.addChild(this.clouds);
        }
        this.stage.addChild(this.world, this.ui);

        this.dayNight = new DayNightCycle(
            this.renderer,
            this.sky,
            // themed and monochrome characters recolour the whole world, the others only their ground line
            characterConfig.monochrome || theme ? [this.world] : [this.ground],
            this.clouds
        );
    }

    private readonly onKeyDown = (event: KeyboardEvent) => {
        const isJumpKey = JUMP_KEYS.includes(event.code);

        switch (this.state) {
            case GameState.Ready:
                if (isJumpKey && !event.repeat) {
                    this.startGame();
                }
                break;
            case GameState.Running:
                if (isJumpKey) {
                    this.player.jump();
                } else if (event.code === "ArrowDown") {
                    this.player.setDuck(true);
                }
                break;
        }
    };

    private readonly onKeyUp = (event: KeyboardEvent) => {
        if (event.code === "ArrowDown") {
            this.player.setDuck(false);
        }

        if (this.state === GameState.GameOver
            && JUMP_KEYS.includes(event.code)
            && performance.now() - this.gameOverAt >= gameConfig.restartDelayMs) {
            this.restartGame();
        }
    };

    private startGame() {
        this.startGameComponent.visible = false;
        this.scoreComponent.visible = true;

        this.state = GameState.Running;
        this.player.startRunning();
        this.obstacles.start();
        this.gameTicker.start();
    }

    private update(deltaTime: number) {
        if (this.state !== GameState.Running) {
            return;
        }

        this.player.update(deltaTime);
        this.ground.update(deltaTime);
        this.obstacles.update(deltaTime);
        this.sky.update(deltaTime);
        this.clouds?.update(deltaTime);

        if (this.obstacles.collidesWith(this.player.hitbox)) {
            this.endGame();
            return;
        }

        if (this.scoreComponent.update(deltaTime)) {
            this.gameTicker.speed *= gameConfig.speedStepMultiplier;
            sound.play("achievement");
        }

        this.dayNight.update(this.scoreComponent.value);
    }

    private endGame() {
        this.state = GameState.GameOver;
        this.gameOverAt = performance.now();
        this.gameTicker.stop();

        this.player.die();
        this.scoreComponent.saveHighScore();

        this.gameOverComponent = new GameOverComponent(this.commonAssets, () => this.restartGame());
        this.ui.addChild(this.gameOverComponent);

        sound.play("gameOver");
    }

    private restartGame() {
        if (this.state !== GameState.GameOver) {
            return;
        }

        this.gameOverComponent?.destroy({children: true});
        this.gameOverComponent = undefined;

        this.scoreComponent.reset();
        this.ground.reset();
        this.obstacles.reset();
        this.dayNight.reset();
        this.player.startRunning();

        this.state = GameState.Running;
        this.gameTicker.speed = 1;
        this.gameTicker.start();
    }
}

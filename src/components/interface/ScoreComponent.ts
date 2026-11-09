import {Container, Text} from "pixi.js";
import {gameConfig} from "../../configuration/gameConfig";
import {scoreTextStyle} from "./textStyles";

const HIGH_SCORE_KEY = "highScoreValue";

export class ScoreComponent extends Container {
    private currentScore: number = 0;
    private lastMilestone: number = 0;
    private highScore: number;

    private readonly textComponent: Text;

    public constructor() {
        super();

        this.highScore = this.readHighScore();

        this.textComponent = new Text("", scoreTextStyle);
        this.textComponent.anchor.set(1, 0);
        this.textComponent.position.set(gameConfig.width - 20, 0);
        this.addChild(this.textComponent);

        this.refreshText();
    }

    public get value() {
        return this.currentScore;
    }

    /** Returns true when the player has just passed another speed-up milestone. */
    public update(deltaTime: number): boolean {
        this.currentScore += deltaTime * gameConfig.scoreCountMultiplier;
        this.refreshText();

        if (this.currentScore - this.lastMilestone > gameConfig.achievementStep) {
            this.lastMilestone = this.currentScore;
            return true;
        }

        return false;
    }

    public reset() {
        this.currentScore = 0;
        this.lastMilestone = 0;
        this.refreshText();
    }

    public saveHighScore() {
        const score = Math.floor(this.currentScore);

        if (score > this.highScore) {
            this.highScore = score;
            this.writeHighScore(score);
            this.refreshText();
        }
    }

    private refreshText() {
        this.textComponent.text = `HI ${this.format(this.highScore)} ${this.format(this.currentScore)}`;
    }

    private format(value: number) {
        return Math.floor(value).toString().padStart(5, "0");
    }

    private readHighScore(): number {
        try {
            return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
        } catch {
            return 0;
        }
    }

    private writeHighScore(value: number) {
        try {
            localStorage.setItem(HIGH_SCORE_KEY, value.toString());
        } catch {
            // storage may be unavailable (private mode, blocked cookies) - the score just isn't persisted
        }
    }
}

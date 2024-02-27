import {Container, Ticker, Text, TextStyle} from "pixi.js";
import {sound} from "@pixi/sound";
import {Game} from "../Game";

export class ScoreComponent extends Container {
    private readonly localStorageKey = "highScoreValue";

    private currentScore: number = 0;
    private achievement: number = 0;

    private sharedTicker: Ticker;

    private readonly textComponent: Text;
    private textComponentStyles = new TextStyle({
        fontFamily: 'PixelifySans',
        stroke: "white",
        strokeThickness: 5,
        fill:"#535353",
        fontSize: 30
    });
    constructor(ticker: Ticker) {
        super();

        this.sharedTicker = ticker;
        this.sharedTicker.add(this.update, this);

        const hi = this.formatScore(this.readLocalStorage());
        const current = this.formatScore(this.currentScore);
        this.textComponent = new Text(`HI ${hi} ${current}`, this.textComponentStyles);

        this.addChild(this.textComponent);

        this.textComponent.anchor.set(1, 0);
        this.textComponent.position.set(Game.WIDTH - 20, 0);
    }

    restoreDefault() {
        this.currentScore = 0;
        this.achievement = 0;

        this.updateTextComponent(this.readLocalStorage(), this.currentScore);
    }

    private updateTextComponent(hi: number, current: number) {
        this.textComponent.text = `HI ${this.formatScore(hi)} ${(this.formatScore(current))}`;
    }

    private update(deltaTime: number) {
        this.currentScore += deltaTime * 0.1;
        this.updateTextComponent(this.readLocalStorage(), this.currentScore);
        if(this.currentScore - this.achievement > 100) {
            this.achievement = this.currentScore;
            this.sharedTicker.speed = this.sharedTicker.speed * 1.2;
            sound.play("achievement");
        }
    }

    private formatScore(value: number) {
        return Math.floor(value).toString().padStart(5, "0");
    }

    private readLocalStorage() {
        const highScore = Number(localStorage.getItem(this.localStorageKey));
        if(!highScore) {
            this.writeLocalStorage();
            return 0;
        }

        return highScore;
    }

    public writeLocalStorage() {
        const highScore = Number(localStorage.getItem(this.localStorageKey));
        if(highScore < this.currentScore) {
            localStorage.setItem(this.localStorageKey, Math.floor(this.currentScore).toString());
        }
    }
}

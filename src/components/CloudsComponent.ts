import {Container, Graphics} from "pixi.js";
import {gameConfig} from "../configuration/gameConfig";
import {lerpColor} from "../configuration/palette";

/** Pixel-art cloud shapes: `#` = body, `s` = shaded underside. One character = one `CELL` px square. */
const SHAPES = [
    [
        "....####......",
        "..########.##.",
        ".############.",
        "##############",
        "ssssssssssssss",
    ],
    [
        "...###.....",
        ".#######.##",
        "###########",
        "ssssssssss.",
    ],
    [
        "..##........",
        ".####..###..",
        "############",
        "ssssssssssss",
    ],
];

const CELL = 4;
const BODY_COLOR = 0xffffff;
const SHADE_COLOR = 0xd2e6f4;
/** Horizontal drift of the clouds in px per frame (the world itself scrolls much faster). */
const DRIFT_SPEED = 0.35;
const CLOUDS_PER_SCREEN = 5;

/** Slowly drifting pixel clouds behind the world; they dim to `nightColor` when the night falls. */
export class CloudsComponent extends Container {
    private readonly layer = new Container();
    private readonly copies: Graphics[] = [];
    private readonly dayColor: number;
    private readonly nightColor: number;
    private offset = 0;

    public constructor(dayColor: number, nightColor: number) {
        super();
        this.dayColor = dayColor;
        this.nightColor = nightColor;

        const placements = this.generatePlacements();

        // two identical copies side by side so the drift can wrap around seamlessly
        for (const index of [0, 1]) {
            const copy = new Graphics();
            for (const {shape, x, y} of placements) {
                this.drawCloud(copy, shape, x, y);
            }
            copy.x = index * gameConfig.width;
            this.copies.push(copy);
            this.layer.addChild(copy);
        }

        this.addChild(this.layer);
    }

    public setNightFactor(night: number) {
        const tint = lerpColor(this.dayColor, this.nightColor, night);

        for (const copy of this.copies) {
            copy.tint = tint;
        }
    }

    public update(deltaTime: number) {
        this.offset = (this.offset + deltaTime * DRIFT_SPEED) % gameConfig.width;
        this.layer.x = -this.offset;
    }

    /** One cloud per horizontal slot, with a random shape and height, so they never pile up. */
    private generatePlacements() {
        const slot = gameConfig.width / CLOUDS_PER_SCREEN;
        const maxY = gameConfig.groundY - 190;

        return Array.from({length: CLOUDS_PER_SCREEN}, (_, i) => {
            const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const width = shape[0].length * CELL;

            return {
                shape,
                x: Math.floor((i * slot + Math.random() * Math.max(slot - width, 0)) / CELL) * CELL,
                y: 12 + Math.floor((Math.random() * maxY) / CELL) * CELL,
            };
        });
    }

    private drawCloud(graphics: Graphics, shape: string[], x: number, y: number) {
        shape.forEach((row, rowIndex) => {
            [...row].forEach((cell, colIndex) => {
                if (cell === ".") {
                    return;
                }

                graphics
                    .beginFill(cell === "s" ? SHADE_COLOR : BODY_COLOR)
                    .drawRect(x + colIndex * CELL, y + rowIndex * CELL, CELL, CELL)
                    .endFill();
            });
        });
    }
}

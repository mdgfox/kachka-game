import {Color, TextStyle} from "pixi.js";
import {palette} from "../../configuration/palette";

const baseStyle = {
    fontFamily: "PixelifySans",
    strokeThickness: 5,
    fill: palette.day.text,
    stroke: palette.day.textStroke,
};

/** Shared by every piece of UI text so the day/night cycle can recolour them all at once. */
export const scoreTextStyle = new TextStyle({...baseStyle, fontSize: 30});
export const titleTextStyle = new TextStyle({...baseStyle, fontSize: 50});

export function applyTextColors(fill: number, stroke: number) {
    const fillHex = new Color(fill).toHex();
    const strokeHex = new Color(stroke).toHex();

    for (const style of [scoreTextStyle, titleTextStyle]) {
        style.fill = fillHex;
        style.stroke = strokeHex;
    }
}

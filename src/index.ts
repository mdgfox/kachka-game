/* eslint-disable */
import {Game} from "./Game";

const game = new Game();

(globalThis as any).__PIXI_APP__ = game;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.body.appendChild(game.view);

game.launch();

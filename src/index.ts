import {Game} from "./components/Game";
import '@pixi/unsafe-eval';

const game = new Game();

// eslint-disable-next-line
(globalThis as any).__PIXI_APP__ = game;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.body.appendChild(game.view);

game.launch();

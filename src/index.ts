import {Game} from "./components/Game";
import '@pixi/unsafe-eval';

const game = new Game();

// eslint-disable-next-line
(globalThis as any).__PIXI_APP__ = game;

document.body.appendChild(game.view as HTMLCanvasElement);

game.launch();

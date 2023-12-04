import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.body.appendChild(app.view);

// create a new Sprite from an image path
const asset = PIXI.Sprite.from('assets/atlas-chrome.png');

// add to stage
app.stage.addChild(asset);

// center the sprite's anchor point
asset.anchor.set(0.5);

// move the sprite to the center of the screen
asset.x = app.screen.width / 2;
asset.y = app.screen.height / 2;

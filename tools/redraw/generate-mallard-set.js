/**
 * Writes the shipped "mallard" character to public/assets/mallard/:
 * the drake (style A) with the autumn obstacle set (set C).
 * ground.png and button.png are shared with the duck character.
 *
 * Usage: node tools/redraw/generate-mallard-set.js
 */
const fs = require('fs'), path = require('path');
const {duckFrame, FRAMES, styles} = require('./characters');
const {sets, obstacleSprites} = require('./obstacles');

const ASSETS = path.resolve(__dirname, '../../public/assets');
const DST = path.join(ASSETS, 'mallard');

function write(file, buf) { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, buf); }

for (const [f, o] of Object.entries(FRAMES)) write(path.join(DST, f), duckFrame(styles.mallard, o).toPNG(2));
for (const [f, cv] of Object.entries(obstacleSprites(sets.autumn))) write(path.join(DST, f), cv.toPNG(2));
for (const f of ['ground.png', 'button.png']) fs.copyFileSync(path.join(ASSETS, 'duck', f), path.join(DST, f));

console.log('Generated', DST);

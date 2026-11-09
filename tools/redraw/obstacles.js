const {Cv, hex, same} = require('./lib');

const WHITE = '#ffffff';
const isC = (...colors) => { const hs = colors.map(c => typeof c === 'string' ? hex(c) : c); return (px) => hs.some(h => same(px, h)); };

// deterministic pseudo random so every run draws the same sprites
function rng(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

// sprinkle single pixels of `color` over pixels accepted by pred
function speckle(cv, color, pred, chance, seed) {
    const r = rng(seed);
    for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) if (cv.get(x, y) && pred(cv.get(x, y)) && r() < chance) cv.set(x, y, color);
}

// white on every upward facing edge of pixels accepted by pred
function snowCaps(cv, pred, depth = 1, color = '#f6fafd') {
    const marks = [];
    for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) {
        const c = cv.get(x, y); if (!c || !pred(c)) continue;
        const up = cv.get(x, y - 1);
        if (!up || !pred(up)) { for (let d = 0; d < depth; d++) marks.push([x, y + d]); }
    }
    for (const [x, y] of marks) cv.over(x, y, color, pred);
}

function cvFor(cells, cw, h) { return new Cv(cw * cells.length, h); }

// ---------------- big (25x50 cells, ground row = 48) ----------------

function trunk(cv, x0, G, h, color, hi, w = 3, dx = 11) {
    cv.rect(x0 + dx, G - h, w, h + 1, color);
    cv.rect(x0 + dx, G - h, 1, h + 1, hi);
    cv.rect(x0 + dx - 1, G, w + 2, 1, color);
}

const trees = {
    round(p) {
        return (cv, x0, G) => {
            trunk(cv, x0, G, 24, p.trunk, p.trunkHi);
            for (const [cx, cy, rx, ry] of [[12.5, G - 37, 10.5, 9], [6.5, G - 31, 6.5, 6], [18.5, G - 31, 6.5, 6], [12.5, G - 29, 9, 5]]) cv.ellipse(x0 + cx, cy, rx, ry, p.leaf);
            cv.line(x0 + 12, G - 25, x0 + 7, G - 31, p.trunk); cv.line(x0 + 13, G - 25, x0 + 18, G - 31, p.trunk);
            cv.bevel(p.leaf, p.leafHi, p.leafLo);
            speckle(cv, p.leafHi, isC(p.leaf), 0.07, 11 + x0);
            speckle(cv, p.leafLo, isC(p.leaf), 0.05, 23 + x0);
            if (p.ground) cv.ellipse(x0 + 12.5, G, 6.5, 1.1, p.ground);
            if (p.after) p.after(cv, x0, G);
        };
    },
    pine(p) {
        return (cv, x0, G) => {
            cv.rect(x0 + 11, G - 8, 3, 9, p.trunk); cv.rect(x0 + 11, G - 8, 1, 9, p.trunkHi);
            const tiers = [[G - 47, 5, G - 37], [G - 41, 8, G - 28], [G - 33, 10.5, G - 17], [G - 24, 11, G - 7]];
            tiers.forEach(([top, half, bottom], i) => {
                const c = x0 + 12.5; const col = i % 2 ? p.leaf2 : p.leaf;
                cv.poly([[c, top], [c + half, bottom - 1], [c + half - 3, bottom], [c + half - 6, bottom - 2], [c - half + 6, bottom - 2], [c - half + 3, bottom], [c - half, bottom - 1]], col);
            });
            cv.bevel(p.leaf, p.leafHi, p.leafLo); cv.bevel(p.leaf2, p.leafHi, p.leafLo);
            if (p.snow) snowCaps(cv, isC(p.leaf, p.leaf2, p.leafHi, p.leafLo), 2);
            if (p.ground) cv.ellipse(x0 + 12.5, G, 6.5, 1.1, p.ground);
        };
    },
    birch(p) {
        return (cv, x0, G) => {
            trunk(cv, x0, G, 29, p.trunk, p.trunkHi);
            for (const y of [6, 11, 15, 21]) cv.rect(x0 + 11 + (y % 2), G - y, 2, 1, p.mark);
            for (const [cx, cy, rx, ry] of [[12.5, G - 37, 8.5, 8], [7, G - 32, 5.5, 5.5], [18, G - 32, 5.5, 5.5], [12.5, G - 29, 8, 4]]) cv.ellipse(x0 + cx, cy, rx, ry, p.leaf);
            cv.bevel(p.leaf, p.leafHi, p.leafLo);
            speckle(cv, p.leafHi, isC(p.leaf), 0.08, 5 + x0);
            if (p.ground) cv.ellipse(x0 + 12.5, G, 6, 1.1, p.ground);
        };
    },
    bare(p) {
        return (cv, x0, G) => {
            trunk(cv, x0, G, 30, p.trunk, p.trunkHi);
            const b = [[12, 30, 4, 42], [13, 27, 21, 40], [12, 24, 7, 33], [13, 36, 10, 46], [13, 33, 17, 46], [12, 20, 3, 28], [13, 18, 22, 27]];
            for (const [sx, sy, ex, ey] of b) { cv.line(x0 + sx, G - sy, x0 + ex, G - ey, p.trunk); cv.line(x0 + sx + 1, G - sy, x0 + ex + 1, G - ey, p.trunk); }
            if (p.snow) snowCaps(cv, isC(p.trunk, p.trunkHi), 1);
            if (p.leaves) speckle(cv, p.leaves, () => true, 0, 1);
            if (p.after) p.after(cv, x0, G);
            if (p.ground) cv.ellipse(x0 + 12.5, G, 6, 1.1, p.ground);
        };
    },
};

// ---------------- small (17x35 cells, ground row = 33) ----------------

const smalls = {
    agaric(p) { // red spotted mushroom
        return (cv, x0, G) => {
            cv.ellipse(x0 + 8.5, G - 23, 8, 9, p.cap); cv.rect(x0, G - 19, 17, 6, null);
            cv.rect(x0 + 6, G - 20, 5, 21, p.stem); cv.rect(x0 + 9, G - 20, 2, 21, p.stemLo); cv.rect(x0 + 5, G - 1, 7, 2, p.stem);
            cv.rect(x0 + 1, G - 19, 15, 1, p.gill);
            cv.bevel(p.cap, p.capHi, p.capLo);
            for (const [sx, sy] of [[4, 27], [10, 29], [8, 24], [13, 25], [4, 22]]) for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) cv.over(x0 + sx + dx, G - sy + dy, p.spot, isC(p.cap, p.capHi, p.capLo));
        };
    },
    parasol(p) { // tall cone cap
        return (cv, x0, G) => {
            cv.rect(x0 + 7, G - 18, 4, 19, p.stem); cv.rect(x0 + 9, G - 18, 2, 19, p.stemLo); cv.rect(x0 + 6, G - 1, 6, 2, p.stem);
            cv.poly([[x0 + 8.5, G - 31], [x0 + 14, G - 24], [x0 + 16, G - 18], [x0 + 1, G - 18], [x0 + 3, G - 24]], p.cap);
            cv.rect(x0 + 1, G - 22, 15, 1, p.band); cv.rect(x0 + 1, G - 18, 15, 1, p.gill);
            cv.bevel(p.cap, p.capHi, p.capLo);
        };
    },
    brown(p) { // round brown cap
        return (cv, x0, G) => {
            cv.ellipse(x0 + 8.5, G - 20, 8.2, 12, p.cap); cv.rect(x0, G - 14, 17, 14, null);
            cv.rect(x0 + 6, G - 16, 5, 17, p.stem); cv.rect(x0 + 9, G - 16, 2, 17, p.stemLo); cv.rect(x0 + 5, G - 1, 7, 2, p.stem);
            cv.rect(x0 + 1, G - 15, 15, 1, p.gill);
            cv.bevel(p.cap, p.capHi, p.capLo);
            speckle(cv, p.capLo, isC(p.cap), 0.06, 41 + x0);
        };
    },
    snowman(p) {
        return (cv, x0, G) => {
            cv.ellipse(x0 + 8.5, G - 5, 6.8, 5.8, '#f4f8fc'); cv.ellipse(x0 + 8.5, G - 14, 5, 5, '#f4f8fc'); cv.ellipse(x0 + 8.5, G - 22, 4.2, 4.2, '#f4f8fc');
            cv.bevel('#f4f8fc', '#ffffff', '#b9cde0');
            cv.line(x0 + 4, G - 14, x0 + 0, G - 19, '#5a3a24'); cv.line(x0 + 13, G - 14, x0 + 16, G - 18, '#5a3a24');
            cv.rect(x0 + 4, G - 18, 9, 2, '#d6433b'); cv.rect(x0 + 11, G - 16, 2, 4, '#d6433b');
            cv.set(x0 + 10, G - 23, '#1d1b1f'); cv.set(x0 + 7, G - 23, '#1d1b1f'); cv.rect(x0 + 11, G - 21, 3, 1, '#f08a24');
            cv.set(x0 + 8, G - 14, '#1d1b1f'); cv.set(x0 + 8, G - 11, '#1d1b1f'); cv.set(x0 + 8, G - 8, '#1d1b1f');
            if (p.hat === 'top') { cv.rect(x0 + 4, G - 26, 9, 1, '#2b2b36'); cv.rect(x0 + 5, G - 30, 7, 4, '#2b2b36'); cv.rect(x0 + 5, G - 27, 7, 1, '#d6433b'); }
            else { cv.ellipse(x0 + 8.5, G - 26, 4.6, 2.8, '#3f7fd0'); cv.rect(x0 + 4, G - 25, 9, 2, '#e8eef8'); cv.set(x0 + 8, G - 29, '#e8eef8'); cv.set(x0 + 9, G - 29, '#e8eef8'); }
        };
    },
    crystal(p) {
        return (cv, x0, G) => {
            cv.poly([[x0 + 8.5, G - 31], [x0 + 12, G - 19], [x0 + 11, G + 1], [x0 + 6, G + 1], [x0 + 5, G - 19]], p.main);
            cv.poly([[x0 + 3, G - 21], [x0 + 6, G - 12], [x0 + 5, G + 1], [x0 + 0.5, G + 1], [x0 + 0.5, G - 12]], p.alt);
            cv.poly([[x0 + 14, G - 17], [x0 + 16.5, G - 9], [x0 + 16.5, G + 1], [x0 + 11.5, G + 1], [x0 + 11.5, G - 9]], p.alt);
            cv.bevel(p.main, p.hi, p.lo); cv.bevel(p.alt, p.hi, p.lo);
        };
    },
    sunflower(p) {
        return (cv, x0, G) => {
            cv.rect(x0 + 8, G - 17, 2, 18, p.stem); cv.rect(x0 + 7, G, 4, 1, p.stem);
            cv.poly([[x0 + 8, G - 6], [x0 + 2, G - 11], [x0 + 1, G - 8], [x0 + 7, G - 3]], p.leaf);
            cv.poly([[x0 + 10, G - 9], [x0 + 16, G - 14], [x0 + 16.5, G - 11], [x0 + 11, G - 6]], p.leaf);
            cv.ellipse(x0 + 8.5, G - 24, 7.6, 7.6, p.petal);
            for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; if (a % 2) cv.set(x0 + 8.5 + Math.cos(t) * 7.4, G - 24 + Math.sin(t) * 7.4, null); }
            cv.ellipse(x0 + 8.5, G - 24, 4.2, 4.2, p.center); cv.bevel(p.petal, p.petalHi, p.petalLo);
            speckle(cv, p.centerHi, isC(p.center), 0.2, 3 + x0);
        };
    },
    corn(p) {
        return (cv, x0, G) => {
            cv.rect(x0 + 8, G - 28, 2, 29, p.stem);
            cv.line(x0 + 8, G - 26, x0 + 4, G - 31, p.stem); cv.line(x0 + 9, G - 26, x0 + 13, G - 31, p.stem); cv.line(x0 + 9, G - 27, x0 + 9, G - 31, p.stem);
            for (const [side, y] of [[-1, 8], [1, 12], [-1, 16], [1, 20]]) { cv.line(x0 + (side < 0 ? 8 : 9), G - y, x0 + (side < 0 ? 1 : 16), G - y - 4, p.leaf); cv.line(x0 + (side < 0 ? 8 : 9), G - y + 1, x0 + (side < 0 ? 1 : 16), G - y - 3, p.leaf); }
            cv.ellipse(x0 + 11.5, G - 15, 2.6, 5.5, p.cob); cv.poly([[x0 + 9, G - 11], [x0 + 14, G - 11], [x0 + 12, G - 5], [x0 + 10, G - 5]], p.husk);
            speckle(cv, p.cobLo, isC(p.cob), 0.25, 9 + x0);
        };
    },
    wheat(p) {
        return (cv, x0, G) => {
            for (const [dx, h] of [[3, 24], [8, 30], [13, 22]]) {
                cv.rect(x0 + dx, G - h, 1, h + 1, p.stem); cv.rect(x0 + dx + 1, G - h, 1, h + 1, p.stem);
                for (let k = 0; k < 6; k++) { const y = G - h + k * 2; cv.rect(x0 + dx - 2 + (k % 2), y, 2, 2, p.grain); cv.rect(x0 + dx + 2 - (k % 2), y + 1, 2, 2, p.grainLo); }
            }
            cv.poly([[x0 + 8, G - 4], [x0 + 1, G - 9], [x0 + 1, G - 6], [x0 + 7, G - 1]], p.stem);
            cv.bevel(p.grain, p.grainHi, null);
        };
    },
};

// ---------------- birds (46 x 34 wings up / 46 x 30 wings down), flying left ----------------

function bird(st, mode) {
    // Frames are top-left anchored (46x34 wings up, 46x30 wings down). The body stays almost in place
    // (1 logical px bob) and the wings swing a full +-13px around it; the tail swings the opposite way.
    const up = mode === 'up';
    const cy = up ? 16 : 15;
    const cv = new Cv(46, up ? 34 : 30);
    cv.poly(up ? [[34, cy], [45, cy + 1], [45, cy + 7], [34, cy + 4]] : [[34, cy - 3], [45, cy - 7], [45, cy - 1], [34, cy + 2]], st.tail);
    cv.line(41, up ? cy + 1 : cy - 6, 41, up ? cy + 6 : cy - 1, st.tailBand);
    cv.ellipse(24, cy, 12.5, 6, st.body);
    cv.ellipse(21, cy + 2.5, 9, 3.8, st.belly, isC(st.body), true);
    cv.ellipse(11, cy - 2, 5.2, 4.8, st.head);
    cv.poly([[0.5, cy - 1], [6, cy - 4], [8, cy + 1], [5, cy + 1.5], [3, cy + 3]], st.beak);
    if (up) {
        cv.poly([[16, cy - 3], [17, cy - 8], [20, cy - 12], [25, cy - 14], [31, cy - 14], [36, cy - 11], [37, cy - 7], [35, cy - 2], [24, cy]], st.wing);
        for (const [x, y] of [[26, cy - 14], [30, cy - 14], [34, cy - 12], [36, cy - 9]]) cv.set(x, y, null);
        for (const [x0, x1] of [[20, 23], [24, 27], [28, 31], [32, 35]]) cv.line(x0, cy - 3, x1, cy - 12, st.wingHi);
    } else {
        cv.poly([[16, cy + 2], [17, cy + 7], [20, cy + 11], [25, cy + 13], [31, cy + 13], [36, cy + 10], [37, cy + 6], [35, cy + 2], [24, cy]], st.wing);
        for (const [x, y] of [[26, cy + 13], [30, cy + 13], [34, cy + 11], [36, cy + 8]]) cv.set(x, y, null);
        for (const [x0, x1] of [[20, 23], [24, 27], [28, 31], [32, 35]]) cv.line(x0, cy + 3, x1, cy + 11, st.wingHi);
    }
    cv.rect(9, cy - 4, 2, 2, '#1d1b1f'); cv.set(9, cy - 4, '#ffffff');
    cv.bevel(st.body, st.bodyHi, st.bodyLo); cv.bevel(st.wing, st.wingHi, st.wingLo);
    cv.outline(WHITE);
    return cv;
}

// ---------------- sets ----------------

const forestLeaf = {leaf: '#4f8f3a', leafHi: '#78b955', leafLo: '#35662a'};
const sets = {
    forest: {
        bigs: [
            trees.round({...forestLeaf, trunk: '#5a3a24', trunkHi: '#7a5236', ground: '#4d9a3a'}),
            trees.pine({leaf: '#2f7a45', leaf2: '#2a6e3e', leafHi: '#4fa268', leafLo: '#1d5230', trunk: '#5a3a24', trunkHi: '#7a5236', ground: '#4d9a3a'}),
            trees.birch({leaf: '#8cc152', leafHi: '#b6df7c', leafLo: '#5f9a38', trunk: '#ece7da', trunkHi: '#ffffff', mark: '#4a4540', ground: '#4d9a3a'}),
        ],
        smalls: [
            smalls.agaric({stem: '#eadfd6', stemLo: '#cdbdb2', cap: '#c93434', capHi: '#e55a4a', capLo: '#8f2323', gill: '#f2e6dc', spot: '#f6e8e0'}),
            smalls.parasol({stem: '#eadfd6', stemLo: '#cdbdb2', cap: '#a89aa8', capHi: '#c9bdc8', capLo: '#7d6f7d', band: '#d9cfd8', gill: '#e5d9e0'}),
            smalls.brown({stem: '#eadfd6', stemLo: '#cdbdb2', cap: '#a8703f', capHi: '#c98f5a', capLo: '#7a4c26', gill: '#e8d3b8'}),
        ],
        bird: {body: '#8a5a34', bodyHi: '#a77a4f', bodyLo: '#6a4122', belly: '#e6d3ac', head: '#7a4d2a', beak: '#f0c23a', tail: '#6a4122', tailBand: '#e6d3ac', wing: '#6b4527', wingHi: '#8f6840', wingLo: '#4b2e18'},
    },
    snow: {
        bigs: [
            trees.round({leaf: '#cfe3ef', leafHi: '#f4fbff', leafLo: '#8fb0cb', trunk: '#5a3a24', trunkHi: '#7a5236', ground: '#e8f1f8'}),
            trees.pine({leaf: '#2c6f58', leaf2: '#245e4a', leafHi: '#4e9a80', leafLo: '#173d30', trunk: '#5a3a24', trunkHi: '#7a5236', snow: true, ground: '#e8f1f8'}),
            trees.bare({trunk: '#5a3a24', trunkHi: '#7a5236', snow: true, ground: '#e8f1f8'}),
        ],
        smalls: [
            smalls.snowman({hat: 'top'}),
            smalls.snowman({hat: 'beanie'}),
            smalls.crystal({main: '#a8dcf2', alt: '#86c4e6', hi: '#ecfaff', lo: '#5aa0cc'}),
        ],
        bird: {body: '#2c3a5a', bodyHi: '#4b5f8a', bodyLo: '#1f2a44', belly: '#44567f', head: '#2c3a5a', beak: '#e8b13a', tail: '#232e49', tailBand: '#44567f', wing: '#26335a', wingHi: '#4b5f8a', wingLo: '#1a2440'},
    },
    autumn: {
        bigs: [
            trees.round({leaf: '#e8851e', leafHi: '#f9ad40', leafLo: '#b25a14', trunk: '#5a3a24', trunkHi: '#7a5236', ground: '#b9722a'}),
            trees.bare({trunk: '#4a3020', trunkHi: '#6a4630', ground: '#b9722a'}),
            trees.birch({leaf: '#f2c230', leafHi: '#ffe27a', leafLo: '#c48f18', trunk: '#ece7da', trunkHi: '#ffffff', mark: '#4a4540', ground: '#b9722a'}),
        ],
        smalls: [
            smalls.sunflower({stem: '#3e8a3a', leaf: '#4aa045', petal: '#f6c21c', petalHi: '#ffe066', petalLo: '#c9961a', center: '#5a3a1e', centerHi: '#8a5a2e'}),
            smalls.corn({stem: '#7ba03a', leaf: '#8fb94a', cob: '#f2c230', cobLo: '#c48f18', husk: '#6c9a35'}),
            smalls.wheat({stem: '#b8923a', grain: '#e8c25a', grainHi: '#f7de88', grainLo: '#b8923a'}),
        ],
        bird: {body: '#6b5f57', bodyHi: '#8a7c72', bodyLo: '#4a403a', belly: '#e0642a', head: '#5a4f48', beak: '#f2c14a', tail: '#4a403a', tailBand: '#6b5f57', wing: '#574c45', wingHi: '#7a6c62', wingLo: '#3c332e'},
    },
};

const COMPOSE = {
    big: {cell: 25, h: 50, files: {'ground-big-1.png': [0], 'ground-big-2.png': [1, 0], 'ground-big-3.png': [0, 1, 2]}, list: 'bigs'},
    small: {cell: 17, h: 35, files: {'ground-small-1.png': [0], 'ground-small-2.png': [0, 1], 'ground-small-3.png': [1, 2, 0]}, list: 'smalls'},
};

function obstacleSprites(set) {
    const out = {};
    for (const kind of Object.values(COMPOSE)) {
        for (const [file, order] of Object.entries(kind.files)) {
            const cv = new Cv(kind.cell * order.length, kind.h);
            order.forEach((idx, i) => set[kind.list][idx](cv, i * kind.cell, kind.h - 2));
            cv.outline(WHITE);
            out['obstacles/' + file] = cv;
        }
    }
    out['obstacles/bird/bird-1.png'] = bird(set.bird, 'up');
    out['obstacles/bird/bird-2.png'] = bird(set.bird, 'down');
    return out;
}

module.exports = {sets, obstacleSprites};

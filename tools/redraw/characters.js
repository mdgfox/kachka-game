const {Cv, hex, same} = require('./lib');

const WHITE = '#ffffff';
const DARK = '#1d1b1f';

// paint `fn`'s drawing onto cv, but only over pixels accepted by pred
function stamp(cv, fn, pred) {
    const tmp = new Cv(cv.w, cv.h); fn(tmp);
    for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) { const c = tmp.get(x, y); if (c) cv.over(x, y, c, pred); }
}
const isC = (...colors) => { const hs = colors.filter(Boolean).map(c => typeof c === 'string' ? hex(c) : c); return (px) => hs.some(h => same(px, h)); };

function legs(cv, s, G, xs, state) {
    const foot = (x, y, w) => { cv.rect(x, y, w, 2, s.feet); };
    xs.forEach((x, i) => {
        const lifted = (state === 'a' && i === 0) || (state === 'b' && i === 1);
        if (state === 'spread') {
            const dir = i === 0 ? -1 : 1;
            for (let k = 0; k < 6; k++) cv.rect(x + dir * Math.floor(k * 0.7), G - 6 + k, 2, 1, s.feet);
            foot(x + dir * 4 - (i === 0 ? 3 : 0), G - 1, 5);
        } else if (lifted) {
            // lifted straight up: same shape as a planted leg, just 3px higher
            cv.rect(x, G - 6, 2, 2, s.feet);
            foot(x, G - 4, 5);
        } else {
            cv.rect(x, G - 6, 2, 5, s.feet);
            foot(x, G - 1, 5);
        }
    });
}

function duckFrame(s, o) {
    const cv = new Cv(o.W, o.H), G = o.H - 2, bob = o.bob || 0;
    const stand = o.pose === 'stand';
    let hx, hy, bx, by, rx, ry;
    if (stand) { hx = 30 + (o.hdx || 0); hy = G - 33 + (o.hdy || 0) + bob; bx = 19; by = G - 16 + bob; rx = 15; ry = 10; }
    else { hx = 47; hy = G - 15 + bob; bx = 24; by = G - 11 + bob; rx = 19; ry = 8; }
    const ctx = {cv, G, hx, hy, bx, by, rx, ry, stand, o};

    legs(cv, s, G, stand ? [11, 21] : [17, 29], o.legs || 'planted');

    // tail
    if (stand) cv.poly([[2, G - 29 + bob], [6, G - 27 + bob], [11, G - 21 + bob], [11, G - 13 + bob], [4, G - 16 + bob], [4, G - 23 + bob]], s.tail);
    else cv.poly([[2, G - 22 + bob], [7, G - 20 + bob], [12, G - 15 + bob], [10, G - 8 + bob], [3, G - 11 + bob], [3, G - 17 + bob]], s.tail);
    // body, belly, neck, head
    cv.ellipse(bx, by, rx, ry, s.body);
    if (s.belly) cv.ellipse(bx + 1, by + ry - 2, rx - 4, 3.5, s.belly, isC(s.body), true);
    if (stand) cv.ellipse(hx - 3, hy + 9, 7, 7, s.neck || s.head);
    else cv.ellipse(hx - 8, hy + 3, 10, 6, s.neck || s.head);
    cv.ellipse(hx, hy, 8.5, 8.5, s.head);
    if (s.headExtra) s.headExtra(ctx);
    // wing
    cv.ellipse(bx - 2, by + 1, stand ? 9 : 11, stand ? 5.5 : 4.5, s.wing);
    cv.poly([[bx - 8, by - 4], [bx - 15, by - 7], [bx - 13, by + 2], [bx - 6, by + 5]], s.wing);
    if (s.beforeContour) s.beforeContour(ctx);
    if (s.inner) cv.inner(s.inner, (px) => ![s.feet, s.beak, s.beakLo].some(c => same(px, hex(c))));

    // bill
    const open = o.beak === 'open';
    cv.rect(hx + 7, hy - (open ? 2 : 1), 6, open ? 2 : 3, s.beak);
    cv.set(hx + 12, hy - (open ? 2 : 1), null);
    if (open) { cv.rect(hx + 7, hy, 5, 1, '#7a2a1a'); cv.rect(hx + 7, hy + 1, 5, 2, s.beakLo); }
    else cv.rect(hx + 7, hy + 2, 5, 1, s.beakLo);

    // eye
    const ex = hx + 3, ey = hy - 2;
    if (o.eye === 'blink') cv.rect(ex - 1, ey + 1, 4, 1, DARK);
    else if (o.eye === 'x') { cv.line(ex - 1, ey - 1, ex + 3, ey + 3, DARK); cv.line(ex + 3, ey - 1, ex - 1, ey + 3, DARK); }
    else { cv.rect(ex, ey, 2, 3, DARK); cv.set(ex + 1, ey, WHITE); }

    if (s.decorate) s.decorate(ctx);
    for (const [base, hi, lo] of s.bevel || []) cv.bevel(base, hi, lo);
    cv.outline(WHITE);
    return cv;
}

// ---------- styles ----------

const mallard = {
    body: '#b4aea3', belly: '#dcd7cc', wing: '#8f877a', tail: '#34343a',
    head: '#1f8f5f', beak: '#f1c93b', beakLo: '#cba22a', feet: '#f28a2a',
    bevel: [['#b4aea3', '#d3cec5', '#8c867c'], ['#1f8f5f', '#47b583', '#146a45'], ['#8f877a', '#aaa294', '#6f685d']],
    decorate({cv, bx, by, hx, hy, stand}) {
        cv.ellipse(bx + (stand ? 10 : 12), by - 2, 6.5, stand ? 7 : 6, '#8a4e2e', isC('#b4aea3', '#dcd7cc'), true);
        for (let x = hx - 10; x <= hx + 10; x++) for (const y of [hy + 8, hy + 9]) cv.over(x, y, WHITE, isC('#1f8f5f'));
    },
};

const cozy = {
    body: '#f6f1e6', wing: '#e4d9c6', tail: '#e4d9c6', head: '#f6f1e6',
    beak: '#ff9a2e', beakLo: '#e07a1a', feet: '#ff9a2e', inner: '#a8977f',
    bevel: [['#f6f1e6', '#ffffff', '#dcd2bf'], ['#e4d9c6', '#f1e9da', '#c5b8a2']],
    headExtra({cv, hx, hy}) { cv.poly([[hx - 2, hy - 8], [hx + 1, hy - 13], [hx + 4, hy - 8]], '#f6f1e6'); cv.poly([[hx - 4, hy - 8], [hx - 5, hy - 11], [hx - 1, hy - 8]], '#f6f1e6'); },
    decorate({cv, hx, hy, stand, o}) {
        const red = '#d6433b', light = '#f29a8e', dark = '#a82e2a';
        const f = o.flap || 0;
        const skin = isC('#f6f1e6', '#ffffff', '#dcd2bf', '#a8977f');
        if (stand) {
            stamp(cv, t => t.rect(hx - 9, hy + 7, 18, 5, red), skin);
            cv.poly([[hx - 6, hy + 9], [hx - 1, hy + 11], [hx - 7 + f, hy + 22], [hx - 13 + f, hy + 19]], red);
        } else {
            stamp(cv, t => t.rect(hx - 15, hy - 2, 5, 15, red), skin);
            cv.poly([[hx - 14, hy + 1], [hx - 10, hy + 3], [hx - 18 + f, hy + 12], [hx - 22 + f, hy + 8]], red);
        }
        for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) { if (same(cv.get(x, y), hex(red))) { if ((x + y) % 4 === 0) cv.set(x, y, light); else if ((x + y) % 4 === 2) cv.set(x, y, dark); } }
        cv.over(hx + 1, hy + 3, '#ffb3b3'); cv.over(hx + 2, hy + 3, '#ffb3b3'); cv.over(hx + 1, hy + 4, '#ffb3b3');
    },
};

const mandarin = {
    body: '#d9a45c', belly: '#f4ecd8', wing: '#a85a2a', tail: '#3a2f4a',
    head: '#2e8f86', neck: '#d97a2c', beak: '#e2463a', beakLo: '#b8321f', feet: '#f2a53a',
    bevel: [['#d9a45c', '#ecc07e', '#b07c3c'], ['#a85a2a', '#c4743c', '#7c3e18'], ['#2e8f86', '#5bb8ad', '#1e6b66'], ['#e8651c', '#f58a3e', '#b0420f'], ['#5a3f9a', '#7c5cc0', '#41296f'], ['#d97a2c', '#f0a24f', '#a85a1a']],
    headExtra({cv, hx, hy}) {
        cv.poly([[hx - 1, hy - 8], [hx - 6, hy - 13], [hx - 14, hy - 10], [hx - 12, hy - 5], [hx - 6, hy - 5]], '#2e8f86');
        cv.poly([[hx - 10, hy - 11], [hx - 16, hy - 9], [hx - 13, hy - 5]], '#6a3f9a');
    },
    beforeContour({cv, bx, by, stand}) {
        if (stand) cv.poly([[bx - 9, by - 4], [bx - 6, by - 16], [bx, by - 12], [bx + 1, by - 4]], '#e8651c');
        else cv.poly([[bx - 7, by - 3], [bx - 5, by - 12], [bx + 1, by - 9], [bx + 2, by - 3]], '#e8651c');
    },
    decorate({cv, hx, hy, bx, by, stand}) {
        const headC = isC('#2e8f86', '#5bb8ad', '#1e6b66');
        cv.ellipse(hx - 1, hy + 4, 3, 2, WHITE, headC, true);
        cv.ellipse(hx - 5, hy + 4, 3.2, 2.6, '#e9822a', headC, true);
        stamp(cv, t => t.line(hx + 1, hy - 4, hx - 8, hy - 7), isC('#2e8f86', '#5bb8ad', '#1e6b66', '#6a3f9a'));
        const bxx = stand ? bx + 10 : bx + 15, byy = by - 1;
        cv.ellipse(bxx, byy, stand ? 6 : 5, stand ? 8 : 6, '#5a3f9a', isC('#d9a45c', '#ecc07e', '#b07c3c', '#f4ecd8'), true);
        stamp(cv, t => { t.line(bxx - 2, byy - 6, bxx - 2, byy + 5, WHITE); t.line(bxx, byy - 6, bxx, byy + 5, WHITE); }, isC('#5a3f9a', '#7c5cc0', '#41296f'));
    },
};

// ---------- frames (sizes in logical px = real size / 2, identical to the original duck sprites) ----------

const FRAMES = {
    'player/start.png': {pose: 'stand', W: 44, H: 45, legs: 'planted', eye: 'open'},
    'player/idle/idle-1.png': {pose: 'stand', W: 44, H: 47, legs: 'planted', eye: 'open'},
    'player/idle/idle-2.png': {pose: 'stand', W: 44, H: 47, legs: 'planted', eye: 'blink', bob: 1},
    'player/run/run-1.png': {pose: 'stand', W: 44, H: 47, legs: 'a', eye: 'open', flap: 2},
    'player/run/run-2.png': {pose: 'stand', W: 44, H: 47, legs: 'b', eye: 'open', bob: -1, flap: -2},
    'player/duck/duck-1.png': {pose: 'duck', W: 59, H: 30, legs: 'a', eye: 'open', flap: 2},
    'player/duck/duck-2.png': {pose: 'duck', W: 59, H: 30, legs: 'b', eye: 'open', bob: -1, flap: -2},
    'player/dead/dead.png': {pose: 'stand', W: 38, H: 42, legs: 'spread', eye: 'x', beak: 'open', hdx: -7, hdy: 4},
    'player/dead/dead-outline.png': {pose: 'stand', W: 44, H: 47, legs: 'spread', eye: 'x', beak: 'open', hdx: -3, hdy: 4},
};

module.exports = {duckFrame, FRAMES, styles: {mallard, cozy, mandarin}};

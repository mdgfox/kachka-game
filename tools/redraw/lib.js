// Tiny pixel-art toolkit. All drawing happens on a "logical" canvas where one
// pixel = 2x2 real pixels (like the original sprites); toPNG() upscales it.
const {encode} = require('../png');

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

class Cv {
    constructor(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
    inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    get(x, y) { return this.inb(x, y) ? this.p[y * this.w + x] : null; }
    set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (this.inb(x, y)) this.p[y * this.w + x] = c ? (typeof c === 'string' ? hex(c) : c) : null; }
    // paint only where the existing pixel satisfies pred (default: any filled pixel)
    over(x, y, c, pred) { x = Math.floor(x); y = Math.floor(y); const cur = this.get(x, y); if (cur && (!pred || pred(cur))) this.set(x, y, c); }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
    ellipse(cx, cy, rx, ry, c, pred, onlyOver) {
        for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
            const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
            if (dx * dx + dy * dy <= 1) { if (onlyOver) this.over(x, y, c, pred); else this.set(x, y, c); }
        }
    }
    poly(pts, c, onlyOver, pred) {
        const ys = pts.map(p => p[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
        for (let y = y0; y <= y1; y++) {
            const xs = []; const yc = y + 0.5;
            for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
                if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
            xs.sort((a, b) => a - b);
            for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) { if (onlyOver) this.over(x, y, c, pred); else this.set(x, y, c); }
        }
    }
    line(x0, y0, x1, y1, c) {
        x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
        for (;;) { this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    }
    // light from the top-left: rim of `base` pixels facing up/left gets `hi`, facing down/right gets `lo`
    bevel(base, hi, lo) {
        base = typeof base === 'string' ? hex(base) : base; const out = this.p.slice();
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
            if (!same(this.get(x, y), base)) continue;
            const up = this.get(x, y - 1), left = this.get(x - 1, y), down = this.get(x, y + 1), right = this.get(x + 1, y);
            if (hi && (!up || !left)) out[y * this.w + x] = typeof hi === 'string' ? hex(hi) : hi;
            else if (lo && (!down || !right)) out[y * this.w + x] = typeof lo === 'string' ? hex(lo) : lo;
        }
        this.p = out;
    }
    // contour on the object's own outermost pixels
    inner(color, pred) {
        color = typeof color === 'string' ? hex(color) : color; const out = this.p.slice();
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
            if (!this.get(x, y) || (pred && !pred(this.get(x, y)))) continue;
            if (!this.get(x - 1, y) || !this.get(x + 1, y) || !this.get(x, y - 1) || !this.get(x, y + 1)) out[y * this.w + x] = color;
        }
        this.p = out;
    }
    outline(color) {
        color = typeof color === 'string' ? hex(color) : color; const out = this.p.slice();
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
            if (this.get(x, y)) continue;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (this.get(x + dx, y + dy)) out[y * this.w + x] = color;
        }
        this.p = out;
    }
    mirrorX() { const out = new Array(this.w * this.h).fill(null); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out[y * this.w + (this.w - 1 - x)] = this.get(x, y); this.p = out; }
    toRGBA(scale = 2) {
        const W = this.w * scale, H = this.h * scale, buf = Buffer.alloc(W * H * 4);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = this.get(Math.floor(x / scale), Math.floor(y / scale)); if (!c) continue; const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; }
        return {w: W, h: H, data: buf};
    }
    toPNG(scale = 2) { const r = this.toRGBA(scale); return encode(r.w, r.h, r.data); }
}

module.exports = {Cv, hex, same};

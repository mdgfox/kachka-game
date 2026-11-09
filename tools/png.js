const fs = require('fs'), zlib = require('zlib');
function decode(file) {
  const b = fs.readFileSync(file); let p = 8; let w, h, ct, plte = null, trns = null; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString('ascii', p+4, p+8), d = b.slice(p+8, p+8+len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    else if (type === 'PLTE') plte = d; else if (type === 'tRNS') trns = d; else if (type === 'IDAT') idat.push(d);
    p += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)); const bpp = ct === 6 ? 4 : ct === 3 ? 1 : 0;
  if (!bpp) throw new Error('unsupported color type ' + ct);
  const stride = w * bpp; const out = Buffer.alloc(h * stride); let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) { const f = raw[y*(stride+1)]; const line = raw.slice(y*(stride+1)+1, (y+1)*(stride+1)); const cur = out.slice(y*stride, (y+1)*stride);
    for (let i = 0; i < stride; i++) { const a = i >= bpp ? cur[i-bpp] : 0, up = prev[i], c = i >= bpp ? prev[i-bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1; else if (f === 4) { const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2*c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? up : c); }
      cur[i] = v & 255; } prev = cur; }
  const rgba = Buffer.alloc(w*h*4);
  for (let i = 0; i < w*h; i++) { if (ct === 6) out.copy(rgba, i*4, i*4, i*4+4); else { const idx = out[i]; rgba[i*4] = plte[idx*3]; rgba[i*4+1] = plte[idx*3+1]; rgba[i*4+2] = plte[idx*3+2]; rgba[i*4+3] = trns && idx < trns.length ? trns[idx] : 255; } }
  return {w, h, data: rgba};
}
function crc32(buf) { let c, crc = ~0; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 255; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function encode(w, h, rgba) { const raw = Buffer.alloc((w*4+1)*h); for (let y = 0; y < h; y++) { raw[y*(w*4+1)] = 0; rgba.copy(raw, y*(w*4+1)+1, y*w*4, (y+1)*w*4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]); }
module.exports = {decode, encode};

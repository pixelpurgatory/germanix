/**
 * Dev-only art-direction check. Not a gate.
 *
 * Decodes rendered screenshots (minimal PNG reader over node:zlib — no
 * dependencies, no browser) and classifies every pixel, so the "accent <= 5%
 * of pixels" and "no cyan, no violet" rules can be measured rather than
 * eyeballed.
 *
 *   node scripts/palette-audit.mjs <file.png> [more.png ...]
 */

import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { basename } from "node:path";

const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let offset = 8;
  let header = null;
  const idat = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  if (!header) throw new Error("no IHDR");
  if (header.depth !== 8 || header.interlace !== 0) {
    throw new Error(`unsupported PNG: depth ${header.depth}, interlace ${header.interlace}`);
  }
  const channels = CHANNELS[header.colorType];
  if (!channels) throw new Error(`unsupported colour type ${header.colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const { width, height } = header;
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = value & 0xff;
    }
  }

  return { width, height, channels, data: out };
}

const NEUTRAL_DELTA = 10; // #8A8A93 itself spans 9
const LIT_THRESHOLD = 26; // above the #0A0A0B / #141416 ground

function classify(png) {
  const { width, height, channels, data } = png;
  const total = width * height;
  const counts = { ground: 0, neutral: 0, warm: 0, cool: 0, green: 0 };

  for (let i = 0; i < total; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);

    if (max < LIT_THRESHOLD) counts.ground++;
    else if (delta <= NEUTRAL_DELTA) counts.neutral++;
    else if (r >= g && g >= b) counts.warm++;
    else if (b > r) counts.cool++;
    else counts.green++;
  }

  return { total, counts };
}

const files = process.argv.slice(2);
if (files.length === 0) throw new Error("usage: node scripts/palette-audit.mjs <file.png> ...");

console.log(
  "file".padEnd(14) +
    "ground%".padStart(9) +
    "neutral%".padStart(10) +
    "warm%".padStart(8) +
    "cool%".padStart(8) +
    "green%".padStart(8),
);

for (const file of files) {
  const { total, counts } = classify(decodePng(await readFile(file)));
  const pct = (n) => ((n / total) * 100).toFixed(2).padStart(7);
  console.log(
    basename(file).padEnd(14) +
      pct(counts.ground) +
      "  " +
      pct(counts.neutral) +
      " " +
      pct(counts.warm) +
      " " +
      pct(counts.cool) +
      " " +
      pct(counts.green),
  );
}

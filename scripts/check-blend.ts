/**
 * Gate: the four-state blend is continuous and lossless.
 *
 * Samples the exact function the shader uses (the constants reach GLSL as
 * uniforms, so this TS mirror and the GLSL mirror cannot drift in value) and
 * asserts:
 *   (a) the four weights sum to 1.0 +/- 0.001 at every one of 1000 steps
 *   (b) no single weight moves more than 0.05 between adjacent steps
 *
 * Run with: node scripts/check-blend.ts
 */

import {
  BLEND_CENTERS,
  BLEND_GLSL,
  BLEND_OVERLAP,
  blendWeights,
} from "../src/gl/states.ts";

const STEPS = 1000;
const SUM_TOLERANCE = 0.001;
const MAX_STEP_DELTA = 0.05;

const failures: string[] = [];

function record(message: string): void {
  if (failures.length < 12) failures.push(message);
  else if (failures.length === 12) failures.push("... further failures suppressed");
}

let maxSumError = 0;
let maxDelta = 0;
let prev = blendWeights(0);

for (let i = 0; i <= STEPS; i++) {
  const p = i / STEPS;
  const w = blendWeights(p);

  const sum = w[0] + w[1] + w[2] + w[3];
  const sumError = Math.abs(sum - 1);
  if (sumError > maxSumError) maxSumError = sumError;
  if (sumError > SUM_TOLERANCE) {
    record(`sum ${sum.toFixed(6)} at p=${p.toFixed(4)} (error ${sumError.toExponential(2)})`);
  }

  if (w[0] < 0 || w[1] < 0 || w[2] < 0 || w[3] < 0) {
    record(`negative weight at p=${p.toFixed(4)}: ${w.join(", ")}`);
  }

  if (i > 0) {
    const worst = Math.max(
      Math.abs(w[0] - prev[0]),
      Math.abs(w[1] - prev[1]),
      Math.abs(w[2] - prev[2]),
      Math.abs(w[3] - prev[3]),
    );
    if (worst > maxDelta) maxDelta = worst;
    if (worst > MAX_STEP_DELTA) {
      record(`weight jumped ${worst.toFixed(4)} at p=${p.toFixed(4)}`);
    }
  }

  prev = w;
}

// The exact sum-to-one relies on the three bands never touching each other.
// If a layout change slid two boundaries together, the weights would still be
// smooth but would stop summing to 1 — assert the precondition directly.
const half = BLEND_OVERLAP / 2;
for (let i = 1; i < BLEND_CENTERS.length; i++) {
  const lower = BLEND_CENTERS[i - 1] ?? 0;
  const upper = BLEND_CENTERS[i] ?? 0;
  if (lower + half >= upper - half) {
    record(`transition bands ${i - 1} and ${i} overlap (${lower} vs ${upper})`);
  }
}
if ((BLEND_CENTERS[0] ?? 0) - half <= 0 || (BLEND_CENTERS[2] ?? 1) + half >= 1) {
  record("a transition band runs past the ends of uProgress");
}

// Every state must actually participate in its transition band.
const bands: ReadonlyArray<readonly [number, number, number]> = [
  [BLEND_CENTERS[0], 0, 1],
  [BLEND_CENTERS[1], 1, 2],
  [BLEND_CENTERS[2], 2, 3],
];
for (const [center, lo, hi] of bands) {
  const w = blendWeights(center);
  const a = [w[0], w[1], w[2], w[3]];
  const wLo = a[lo] ?? 0;
  const wHi = a[hi] ?? 0;
  if (wLo <= 0 || wHi <= 0) {
    record(`states ${lo}/${hi} are not both live at band centre p=${center}`);
  }
}

// Structural guard: the GLSL mirror must still read the shared uniforms rather
// than a divergent set of inlined literals.
for (const token of ["centers.x", "centers.y", "centers.z", "overlap", "smoothstep"]) {
  if (!BLEND_GLSL.includes(token)) {
    record(`BLEND_GLSL no longer references "${token}" — TS/GLSL mirrors have drifted`);
  }
}

console.log(`check-blend: ${STEPS + 1} samples, overlap ${BLEND_OVERLAP}, centres ${BLEND_CENTERS.join("/")}`);
console.log(`  max |sum - 1|      ${maxSumError.toExponential(3)}  (tolerance ${SUM_TOLERANCE})`);
console.log(`  max step delta     ${maxDelta.toFixed(6)}  (limit ${MAX_STEP_DELTA})`);

if (failures.length > 0) {
  for (const f of failures) console.error(`  FAIL ${f}`);
  throw new Error(`check-blend failed with ${failures.length} problem(s)`);
}

console.log("check-blend: PASS");

/**
 * The four visual states and the single blend that fuses them.
 *
 * This module is the sole authority on blend windows. The TypeScript function
 * `blendWeights` and the GLSL chunk `BLEND_GLSL` implement the identical
 * formula and read the identical constants (the constants reach the shader as
 * uniforms, never as duplicated literals), so `scripts/check-blend.ts` can
 * verify the shader's behaviour by testing the TS mirror.
 *
 * Deliberately free of any `three` import so plain Node can load it.
 */

export type StateWeights = readonly [number, number, number, number];

export interface StateMeta {
  readonly key: "A" | "B" | "C" | "D";
  readonly title: string;
}

export const STATES: readonly StateMeta[] = [
  { key: "A", title: "lattice" },
  { key: "B", title: "terrain" },
  { key: "C", title: "shell" },
  { key: "D", title: "array" },
];

/** Centres of the three transition bands along uProgress (0 -> 1). */
export const BLEND_CENTERS: readonly [number, number, number] = [0.3, 0.55, 0.8];

/** Width of each transition band. Every state has nonzero weight inside it. */
export const BLEND_OVERLAP = 0.08;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Weights for states A, B, C, D at a given scroll progress.
 *
 * Because the three bands never overlap one another, the four terms telescope
 * to exactly 1 at every p: outside a band the neighbouring gates are hard 0/1,
 * inside a band the two live terms are `1 - s` and `s`.
 */
export function blendWeights(progress: number): StateWeights {
  const p = clamp01(progress);
  const h = BLEND_OVERLAP * 0.5;
  const a = smoothstep(BLEND_CENTERS[0] - h, BLEND_CENTERS[0] + h, p);
  const b = smoothstep(BLEND_CENTERS[1] - h, BLEND_CENTERS[1] + h, p);
  const c = smoothstep(BLEND_CENTERS[2] - h, BLEND_CENTERS[2] + h, p);
  return [1 - a, a * (1 - b), b * (1 - c), c];
}

/** Progress value that sits in the middle of state `index`'s plateau. */
export function plateauCenter(index: number): number {
  const h = BLEND_OVERLAP * 0.5;
  const [c0, c1, c2] = BLEND_CENTERS;
  if (index <= 0) return (c0 - h) * 0.5;
  if (index === 1) return (c0 + h + (c1 - h)) * 0.5;
  if (index === 2) return (c1 + h + (c2 - h)) * 0.5;
  return (c2 + h + 1) * 0.5;
}

/** GLSL mirror of `blendWeights`. Reads uBlendCenters / uBlendOverlap. */
export const BLEND_GLSL = /* glsl */ `
vec4 blendWeights(float p, vec3 centers, float overlap) {
  float h = overlap * 0.5;
  float a = smoothstep(centers.x - h, centers.x + h, p);
  float b = smoothstep(centers.y - h, centers.y + h, p);
  float c = smoothstep(centers.z - h, centers.z + h, p);
  return vec4(1.0 - a, a * (1.0 - b), b * (1.0 - c), c);
}
`;

/**
 * PHASE 1 STUBS. Crude placeholders — the blend is what is under test here.
 * Each function reads only the fixed instance attribute set.
 */
export const STATE_A_GLSL = /* glsl */ `
vec3 stateA(vec3 grid, vec3 seed, float id) {
  return (grid - 0.5) * vec3(14.0, 8.0, 8.0);
}
`;

export const STATE_B_GLSL = /* glsl */ `
vec3 stateB(vec3 grid, vec3 seed, float id) {
  vec2 xz = (grid.xz - 0.5) * vec2(16.0, 16.0);
  float y = sin(xz.x * 0.5 + uTime) * cos(xz.y * 0.5) * 1.5;
  return vec3(xz.x, y, xz.y);
}
`;

export const STATE_C_GLSL = /* glsl */ `
vec3 stateC(vec3 grid, vec3 seed, float id) {
  vec3 dir = normalize(seed * 2.0 - 1.0 + vec3(0.0001));
  return dir * 5.0;
}
`;

export const STATE_D_GLSL = /* glsl */ `
vec3 stateD(vec3 grid, vec3 seed, float id) {
  vec3 c = floor(grid * vec3(4.0, 2.0, 4.0)) / vec3(4.0, 2.0, 4.0);
  return (c - 0.5) * vec3(16.0, 8.0, 16.0);
}
`;

export const STATES_GLSL = [
  STATE_A_GLSL,
  STATE_B_GLSL,
  STATE_C_GLSL,
  STATE_D_GLSL,
  BLEND_GLSL,
].join("\n");

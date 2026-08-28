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

/**
 * Page layout, in vh. The blend windows *are* the page layout — a transition
 * has to land on a section boundary or the copy and the geometry disagree — so
 * both are derived from this one block. `page.ts` sizes the sections from it.
 */
export const LAYOUT_VH = {
  hero: 180,
  section: 140,
  conversion: 100,
  // The footer is content-sized rather than pinned, so this tracks what it
  // actually measures at desktop width. If it drifts, every blend centre
  // shifts with it, because progress is scrollY over the whole document.
  footer: 42,
  viewport: 100,
} as const;

const TOTAL_VH =
  LAYOUT_VH.hero + LAYOUT_VH.section * 4 + LAYOUT_VH.conversion + LAYOUT_VH.footer;
const SCROLL_VH = TOTAL_VH - LAYOUT_VH.viewport;

/** Width of each transition band. Every state has nonzero weight inside it. */
export const BLEND_OVERLAP = 0.08;

/** Scroll progress at the boundary after section `i` (1-based). */
function boundary(i: number): number {
  return (LAYOUT_VH.hero + i * LAYOUT_VH.section) / SCROLL_VH;
}

/**
 * Centres of the three transition bands along uProgress (0 -> 1).
 *
 * Each band *ends* on a section boundary rather than being centred on it. A
 * section's copy pins the moment its boundary is crossed, so a centred band
 * would leave the morph still resolving through the first half of the pin —
 * the reader gets a half-blended cloud while reading about terrain. Ending the
 * band there means the state is fully settled exactly as its copy locks in.
 */
export const BLEND_CENTERS: readonly [number, number, number] = [
  boundary(1) - BLEND_OVERLAP / 2,
  boundary(2) - BLEND_OVERLAP / 2,
  boundary(3) - BLEND_OVERLAP / 2,
];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
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

/** Index of the state carrying the most weight. Drives the active nav item. */
export function dominantState(progress: number): number {
  const w = blendWeights(progress);
  let best = 0;
  let bestWeight = w[0];
  if (w[1] > bestWeight) [best, bestWeight] = [1, w[1]];
  if (w[2] > bestWeight) [best, bestWeight] = [2, w[2]];
  if (w[3] > bestWeight) best = 3;
  return best;
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
 * Shared helpers for the state functions. Kept out of the individual states so
 * each state function reads as a single idea.
 */
export const STATE_SUPPORT_GLSL = /* glsl */ `
const float TAU = 6.28318530718;

/**
 * fract(i * phi) at full precision for i up to ~10^6.
 *
 * A naive fract(i * 0.618) loses the low mantissa bits once i * phi passes a
 * few thousand, which collapses 45k distinct longitudes onto a few hundred and
 * puts visible seams down the shell. Splitting i into a 1024-block index and a
 * remainder keeps both products small enough to stay exact.
 */
float goldenFract(float i) {
  const float G = 0.6180339887;
  const float G1024 = 0.8668044799; // fract(1024.0 * G)
  float k = floor(i / 1024.0);
  float lo = i - k * 1024.0;
  return fract(fract(k * G1024) + fract(lo * G));
}

/** Point at parameter t along edge e (0..11) of the unit cube, centred. */
vec3 cubeEdge(float e, float t) {
  float axis = floor(e / 4.0);
  float k = mod(e, 4.0);
  float a = mod(k, 2.0);
  float b = floor(k / 2.0);
  vec3 p;
  if (axis < 0.5) p = vec3(t, a, b);
  else if (axis < 1.5) p = vec3(a, t, b);
  else p = vec3(a, b, t);
  return p - 0.5;
}
`;

/**
 * A — dense grid lattice, curl-noise displaced, the displacement radiating out
 * of the pointer hit point.
 */
export const STATE_A_GLSL = /* glsl */ `
const vec3 A_EXTENT = vec3(19.0, 10.0, 9.5);

vec3 stateA(vec3 grid, vec3 seed, float id) {
  vec3 p = (grid - 0.5) * A_EXTENT;

  // Ambient drift, enough to break the axis-aligned moire of a perfect lattice.
  p += curlNoise(p * 0.115 + vec3(0.0, 0.0, uTime * 0.035)) * 0.5;

  // Radial swell out of the pointer, gaussian in the screen-facing plane.
  vec3 toP = p - uPointer;
  float d2 = dot(toP.xy, toP.xy);
  float infl = exp(-d2 * 0.045) * uPointerStrength;
  if (infl > 0.002) {
    p += normalize(toP + vec3(1e-4)) * infl * 2.9;
    p += curlNoise(p * 0.3 + vec3(uTime * 0.12)) * infl * 1.35;
  }
  return p;
}
`;

/**
 * B — cascading wireframe terrain. Height is fbm; the sheet terraces into
 * contour steps and peels over its far edge. uScrollVelocity bends it.
 *
 * The wireframe read is structural, not a material: grid.xz picks a terrain
 * cell and grid.y walks the particle along one of that cell's two edges, so
 * the lattice literally draws the quad edges of the surface.
 */
export const STATE_B_GLSL = /* glsl */ `
const vec2 B_EXTENT = vec2(21.0, 17.0);
const float B_TILT = 0.34; // tips the sheet off edge-on for a level camera

vec3 stateB(vec3 grid, vec3 seed, float id) {
  float t = grid.y;
  float alongZ = step(0.5, fract(id * 0.5)); // alternate edge orientation
  vec2 cell = grid.xz + mix(vec2(t, 0.0), vec2(0.0, t), alongZ) * uCellStep;

  vec2 xz = (cell - 0.5) * B_EXTENT;

  float h = fbm2(xz * 0.115 + vec2(uTime * 0.022, 0.0));
  float terraced = floor(h * 3.5) / 3.5;
  h = mix(h, terraced, 0.55) * 3.0;

  // The near edge of the sheet cascades down and toward the viewer.
  float fall = smoothstep(0.45, 1.0, cell.y);
  float fall2 = fall * fall;

  float bend = uScrollVelocity;
  float y = h * (1.0 - fall * 0.5) - fall2 * 5.6;
  y += sin(xz.y * 0.19 + uTime * 0.45) * bend * 2.1;

  vec3 q = vec3(xz.x + bend * xz.y * 0.09, y, xz.y + fall2 * 2.4);

  float ca = cos(B_TILT);
  float sa = sin(B_TILT);
  q.yz = vec2(q.y * ca - q.z * sa, q.y * sa + q.z * ca);

  return q + vec3(0.0, 1.1, 0.0);
}
`;

/**
 * C — spherical shell on a Fibonacci lattice, radius modulated by fbm.
 *
 * The liquid read is NOT produced here. It comes from the per-instance
 * fresnel-weighted RGB channel offset in the fragment shader — three slightly
 * divergent sample positions per particle. No second mesh, no transmission.
 */
export const STATE_C_GLSL = /* glsl */ `
const float C_RADIUS = 6.1;

vec3 stateC(vec3 grid, vec3 seed, float id) {
  float i = id + 0.5;
  float cosPhi = 1.0 - 2.0 * i / uCount;
  float sinPhi = sqrt(max(0.0, 1.0 - cosPhi * cosPhi));
  float theta = TAU * goldenFract(i);
  vec3 dir = vec3(cos(theta) * sinPhi, cosPhi, sin(theta) * sinPhi);

  float n = fbm3(dir * 1.85 + vec3(0.0, uTime * 0.085, uTime * 0.05));
  float r = C_RADIUS * (1.0 + 0.155 * n);

  // A slow drift on the shell surface keeps it reading as fluid, not printed.
  r += sin(theta * 3.0 + uTime * 0.6) * 0.07;

  return dir * r;
}
`;

/**
 * D — particles snapped onto the bounding-box wireframe edges of a 4x2x4
 * array. The uScanY scanline band is applied in the vertex shader's main(),
 * where it can read the blended position; here we only place the edges.
 */
export const STATE_D_GLSL = /* glsl */ `
const vec3 D_PITCH = vec3(3.9, 3.7, 3.9);
const vec3 D_CELL = vec3(2.85, 2.7, 2.85);
const vec3 D_ORIGIN = vec3(1.5, 0.5, 1.5); // centres a 4 x 2 x 4 array

vec3 stateD(vec3 grid, vec3 seed, float id) {
  float cellIndex = mod(id, 32.0);
  vec3 cell = vec3(
    mod(cellIndex, 4.0),
    mod(floor(cellIndex / 4.0), 2.0),
    floor(cellIndex / 8.0)
  );

  float rest = floor(id / 32.0);
  float edge = mod(rest, 12.0);
  float slot = floor(rest / 12.0);
  float t = clamp((slot + 0.5) / uEdgeSamples, 0.0, 1.0);

  vec3 local = cubeEdge(edge, t) * D_CELL;
  return (cell - D_ORIGIN) * D_PITCH + local;
}
`;

export const STATES_GLSL = [
  STATE_SUPPORT_GLSL,
  STATE_A_GLSL,
  STATE_B_GLSL,
  STATE_C_GLSL,
  STATE_D_GLSL,
  BLEND_GLSL,
].join("\n");

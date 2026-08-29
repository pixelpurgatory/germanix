import { NOISE_GLSL } from "./noise.glsl.ts";
import { STATES_GLSL } from "../states.ts";

/**
 * One vertex shader for all four states.
 *
 * Reads only the fixed per-instance attribute set (aId, aSeed, aGridCoord),
 * uploaded once at init. Position is the weighted blend of four position
 * functions; the weights come from the single uniform float uProgress.
 */
export const PARTICLE_VERT = /* glsl */ `
precision highp float;

attribute float aId;
attribute vec3 aSeed;
attribute vec3 aGridCoord;

uniform float uTime;
uniform float uProgress;
uniform vec4 uBlendCenters;
uniform float uBlendOverlap;
uniform vec3 uPointer;
uniform float uPointerStrength;
uniform float uScrollVelocity;
uniform float uScanY;
uniform float uScanWidth;
uniform float uCount;
uniform vec2 uCellStep;
uniform float uEdgeSamples;
uniform float uWingCount;
uniform float uAbdomenEnd;
uniform float uThoraxEnd;
uniform float uThoraxCount;
uniform float uAspect;
uniform float uSize;
uniform float uChroma;
uniform vec2 uDepthFade;

varying vec2 vUv;
varying float vAlpha;
varying float vShade;
varying vec2 vChroma;
varying float vScan;

${NOISE_GLSL}
${STATES_GLSL}

void main() {
  // Four gates telescope into five weights that sum to exactly 1.
  vec4 g = blendGates(uProgress, uBlendCenters, uBlendOverlap);
  float wZ = 1.0 - g.x;
  float wA = g.x * (1.0 - g.y);
  float wB = g.y * (1.0 - g.z);
  float wC = g.z * (1.0 - g.w);
  float wD = g.w;

  float dfAlpha = 1.0;
  float dfAccent = 0.0;

  vec3 p = vec3(0.0);
  if (wZ > 0.0) p += wZ * dragonfly(aSeed, aId, dfAlpha, dfAccent);
  if (wA > 0.0) p += wA * stateA(aGridCoord, aSeed, aId);
  if (wB > 0.0) p += wB * stateB(aGridCoord, aSeed, aId);
  if (wC > 0.0) p += wC * stateC(aGridCoord, aSeed, aId);
  if (wD > 0.0) p += wD * stateD(aGridCoord, aSeed, aId);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  float fade = 1.0 - smoothstep(uDepthFade.x, uDepthFade.x + uDepthFade.y, depth);

  // Chromatic divergence: fresnel on the shell normal, screen-space direction.
  vec3 shellN = normalize(p + vec3(1e-5));
  vec3 viewDir = normalize(cameraPosition - p);
  float fresnel = pow(1.0 - clamp(dot(shellN, viewDir), 0.0, 1.0), 3.0);
  vChroma = normalize(mv.xy + vec2(1e-5)) * (fresnel * uChroma * wC);

  // Accent channel: the state D scanline band, and the dragonfly's pterostigma.
  float band = 1.0 - smoothstep(0.0, uScanWidth, abs(p.y - uScanY));
  vScan = band * wD + dfAccent * wZ;

  float size = uSize * (0.55 + 0.85 * aSeed.z) * mix(0.42, 1.0, fade);
  mv.xy += position.xy * size;

  vUv = uv;
  vAlpha = mix(0.10, 1.0, fade) * (0.45 + 0.65 * aSeed.y) * mix(1.0, dfAlpha, wZ);
  vShade = mix(0.62, 1.0, clamp(p.y * 0.5 + 0.5, 0.0, 1.0));

  gl_Position = projectionMatrix * mv;
}
`;

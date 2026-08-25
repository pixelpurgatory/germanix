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
uniform vec3 uBlendCenters;
uniform float uBlendOverlap;
uniform vec3 uPointer;
uniform float uPointerStrength;
uniform float uScrollVelocity;
uniform float uScanY;
uniform float uScanWidth;
uniform float uCount;
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
  vec4 w = blendWeights(uProgress, uBlendCenters, uBlendOverlap);

  vec3 p = vec3(0.0);
  if (w.x > 0.0) p += w.x * stateA(aGridCoord, aSeed, aId);
  if (w.y > 0.0) p += w.y * stateB(aGridCoord, aSeed, aId);
  if (w.z > 0.0) p += w.z * stateC(aGridCoord, aSeed, aId);
  if (w.w > 0.0) p += w.w * stateD(aGridCoord, aSeed, aId);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  float fade = 1.0 - smoothstep(uDepthFade.x, uDepthFade.x + uDepthFade.y, depth);

  // Chromatic divergence: fresnel on the shell normal, screen-space direction.
  vec3 shellN = normalize(p + vec3(1e-5));
  vec3 viewDir = normalize(cameraPosition - p);
  float fresnel = pow(1.0 - clamp(dot(shellN, viewDir), 0.0, 1.0), 3.0);
  vChroma = normalize(mv.xy + vec2(1e-5)) * (fresnel * uChroma * w.z);

  // Scanline band, state D only.
  float band = 1.0 - smoothstep(0.0, uScanWidth, abs(p.y - uScanY));
  vScan = band * w.w;

  float size = uSize * (0.55 + 0.85 * aSeed.z) * mix(0.42, 1.0, fade);
  mv.xy += position.xy * size;

  vUv = uv;
  vAlpha = mix(0.10, 1.0, fade) * (0.45 + 0.65 * aSeed.y);
  vShade = mix(0.62, 1.0, clamp(p.y * 0.5 + 0.5, 0.0, 1.0));

  gl_Position = projectionMatrix * mv;
}
`;

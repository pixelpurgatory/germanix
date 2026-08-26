/**
 * One fragment shader for all four states.
 *
 * The "liquid" read of state C is produced here and only here: the sprite
 * falloff is evaluated at three slightly divergent positions — one per colour
 * channel — offset along a per-instance fresnel-weighted screen-space vector.
 * No second mesh, no transmission material.
 */
export const PARTICLE_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColorParticle;
uniform vec3 uColorAccent;
uniform float uOpacity;
uniform float uChromaMix;

varying vec2 vUv;
varying float vAlpha;
varying float vShade;
varying vec2 vChroma;
varying float vScan;

float sprite(vec2 uv) {
  float d = length(uv - 0.5) * 2.0;
  return 1.0 - smoothstep(0.30, 1.0, d);
}

void main() {
  float r = sprite(vUv - vChroma);
  float g = sprite(vUv);
  float b = sprite(vUv + vChroma);

  float a = max(g, max(r, b));
  if (a <= 0.002) discard;

  // vec3(r,g,b)/a is exactly vec3(1.0) when vChroma is zero, so every state
  // other than C stays perfectly neutral.
  vec3 split = clamp(vec3(r, g, b) / max(a, 1e-4), 0.0, 1.0);

  // A raw channel split drifts straight into cyan and violet on the limb.
  // Keep the divergence but cap how far the hue can travel, and spend the
  // residue on the warm accent so the shell reads wet rather than aberrated.
  float spread = abs(r - b) / max(a, 1e-4);
  vec3 col = uColorParticle * mix(vec3(1.0), split, uChromaMix) * vShade;
  col = mix(col, uColorAccent, clamp(spread, 0.0, 1.0) * 0.45);
  col = mix(col, uColorAccent, clamp(vScan, 0.0, 1.0) * 0.9);

  float alpha = a * vAlpha * uOpacity * (1.0 + vScan * 1.15);

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));

  #include <colorspace_fragment>
}
`;

/**
 * The dragonfly: a fifth position function for the same instanced system.
 *
 * No model file and no second mesh. The whole animal is derived in the vertex
 * shader from the fixed attribute set, so it costs one more branch and nothing
 * else. Particles are dealt to wings, abdomen, thorax and head by index, and
 * the wing membrane is drawn the way a real one reads: longitudinal veins,
 * cross veins between them, and a thin scatter for the membrane itself.
 *
 * Wing kinematics follow a real dragonfly rather than a bird: forewings and
 * hindwings counterstroke about half a cycle apart, each wing feathers about
 * its own span axis as it reverses, and the tip lags the root.
 */
export const DRAGONFLY_GLSL = /* glsl */ `
const float DF_BEAT = 5.2;          // wingbeats per second
const float DF_FLAP = 0.58;         // stroke amplitude, radians
const float DF_HIND_PHASE = 1.95;   // hindwing lag, radians

vec3 rotX(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotZ(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}

/** Half chord width across the span. Narrow root, widest past middle, soft tip. */
float dfHalfChord(float s) {
  return pow(s + 0.05, 0.34) * pow(1.03 - s, 0.30);
}

/** One wing, in body space. Arg wing is 0..3: 0,1 forewings, 2,3 hindwings. */
vec3 dfWing(float wing, float q, vec3 seed, out float alpha, out float accent) {
  float isHind = step(2.0, wing);
  float side = mod(wing, 2.0) < 0.5 ? 1.0 : -1.0;

  float span = mix(5.95, 5.45, isHind);
  float chord = mix(0.86, 1.06, isHind);
  float rootZ = mix(2.62, 1.42, isHind);
  // Negative sweep carries the tip toward the head, positive toward the tail.
  // Fanning the pair in opposite directions is what keeps a side reading as
  // two wings instead of one long blade.
  float sweep = mix(-0.30, 0.34, isHind);

  // Three populations: longitudinal veins, cross veins, membrane scatter.
  float lane = mod(q, 5.0);
  float k = floor(q / 5.0);

  float s;
  float v;
  alpha = 1.0;

  if (lane < 2.0) {
    // Longitudinal veins. Vein 0 is the leading edge and gets double weight,
    // which is what gives the wing a crisp front line. The exponent bunches
    // the rest toward that edge: evenly spaced veins read as graph paper,
    // while a real wing is dense at the front and open at the trailing edge.
    float vein = mod(k, 10.0);
    vein = vein > 8.0 ? 0.0 : vein;
    v = pow(vein / 8.0, 1.5) * 2.0 - 1.0;
    s = goldenFract(k);
  } else if (lane < 4.0) {
    // Cross veins, packed tighter toward the wing base. Few and far apart and
    // the membrane reads as a ladder rather than as venation.
    float c = mod(k, 44.0) / 44.0;
    s = pow(c, 0.82) + 0.010;
    v = goldenFract(k) * 2.0 - 1.0;
  } else {
    // Membrane, dimmer so the venation still reads as the structure.
    s = seed.x;
    v = seed.y * 2.0 - 1.0;
    alpha = 0.30;
  }

  float hc = dfHalfChord(s) * chord;

  // Pterostigma: the small opaque cell on the leading edge near the tip.
  float stig = smoothstep(0.80, 0.845, s) * (1.0 - smoothstep(0.895, 0.925, s));
  stig *= smoothstep(-0.62, -0.80, v);
  accent = stig;
  alpha = mix(alpha, 1.0, stig);

  float phase = TAU * DF_BEAT * uTime + isHind * DF_HIND_PHASE;
  float flap = DF_FLAP * sin(phase);
  float vel = cos(phase);

  vec3 p = vec3(s * span, 0.0, v * hc);

  // Feather about the span axis, strongest at the tip and at stroke reversal.
  p = rotX(p, -vel * 0.44 * (0.22 + 0.78 * s));
  p = rotY(p, sweep);
  // Tip lags the root, so the wing arrives slightly bent.
  p = rotZ(p, flap + vel * 0.17 * s * s);

  p.x *= side;
  return p + vec3(side * 0.46, 0.16 - isHind * 0.12, rootZ);
}

/** Segmented abdomen: rings and longitudinal ridges, swaying toward the tip. */
vec3 dfAbdomen(float q, out float alpha) {
  alpha = 1.0;
  // One lane of segment rings against two of longitudinal ridges plus a
  // scatter. Rings alone, on a body this slender, read as a coiled spring.
  float lane = mod(q, 4.0);
  float k = floor(q / 4.0);

  float t;
  float ang;
  if (lane < 1.0) {
    t = (mod(k, 10.0) + 0.5) / 10.0;   // segment joints
    ang = TAU * goldenFract(k);
  } else if (lane < 3.0) {
    t = goldenFract(k);                // ridges running the length
    ang = TAU * (mod(k, 11.0) / 11.0);
  } else {
    t = fract(goldenFract(k) + 0.37);  // surface fill
    ang = TAU * fract(k * 0.2393);
    alpha = 0.55;
  }

  float z = mix(1.25, -5.40, t);
  // Tapers, but never to a thread: too thin and the segment rings read as the
  // rungs of a ladder rather than as a body.
  float rad = mix(0.46, 0.21, pow(t, 0.62));

  vec3 p = vec3(cos(ang) * rad, sin(ang) * rad * 0.88, z);

  // The abdomen is long and light, so it trails the thorax.
  float lag = t * t;
  p.x += sin(TAU * 0.42 * uTime - t * 1.7) * 0.34 * lag;
  p.y += sin(TAU * 0.37 * uTime - t * 1.3) * 0.14 * lag - 0.26 * lag;
  return p;
}

vec3 dfThorax(float q) {
  float i = q + 0.5;
  float cosPhi = 1.0 - 2.0 * i / max(1.0, uThoraxCount);
  float sinPhi = sqrt(max(0.0, 1.0 - cosPhi * cosPhi));
  float theta = TAU * goldenFract(i);
  vec3 dir = vec3(cos(theta) * sinPhi, cosPhi, sin(theta) * sinPhi);
  return dir * vec3(0.74, 0.68, 0.92) + vec3(0.0, 0.02, 2.15);
}

/**
 * Head plus the two big compound eyes.
 *
 * Each of the three gets its own Fibonacci sphere over its own population
 * count. Deriving the polar angle from a hash instead leaves visible rosettes,
 * because the samples are no longer equal-area in cos(phi).
 */
vec3 dfHead(float q, float total, out float alpha) {
  float part = mod(q, 3.0);           // 0 head, 1 and 2 the eyes
  float k = floor(q / 3.0);
  float n = max(1.0, floor(total / 3.0));

  float i = k + 0.5;
  float cosPhi = 1.0 - 2.0 * clamp(i / n, 0.0, 1.0);
  float sinPhi = sqrt(max(0.0, 1.0 - cosPhi * cosPhi));
  float theta = TAU * goldenFract(i + part * 4096.0);
  vec3 dir = vec3(cos(theta) * sinPhi, cosPhi, sin(theta) * sinPhi);

  if (part < 1.0) {
    alpha = 0.9;
    return dir * vec3(0.40, 0.36, 0.38) + vec3(0.0, -0.02, 3.30);
  }
  alpha = 1.0;
  float side = part < 2.0 ? 1.0 : -1.0;
  return dir * vec3(0.33, 0.32, 0.31) + vec3(side * 0.34, 0.12, 3.58);
}

/**
 * Hover, drift, and a slow bank toward the pointer.
 *
 * The body is modelled head along +Z with the wings spanning X, which faces
 * the camera nose on. The two quarter turns put it into a dorsal view with the
 * body across the frame, so the wings read at full span instead of edge on;
 * everything after that is the deviation from that presentation.
 */
vec3 dfOrient(vec3 p, float narrow) {
  float t = uTime;
  float bank = uPointerStrength * clamp(uPointer.x * 0.035, -0.35, 0.35);
  float lift = uPointerStrength * clamp(uPointer.y * 0.030, -0.30, 0.30);

  p = rotX(p, 1.5708);
  p = rotZ(p, 1.5708);

  p = rotZ(p, -0.17 + 0.05 * sin(TAU * 0.13 * t + 2.0) - bank * 0.5);
  p = rotY(p, -0.40 + 0.08 * sin(TAU * 0.11 * t) + bank);
  p = rotX(p, -0.22 + 0.05 * sin(TAU * 0.15 * t + 1.0) + lift);

  // On a phone the frustum is only about seven world units wide, so a
  // dragonfly parked beside the copy sits entirely off the right edge. There
  // it moves above the copy instead.
  vec3 home = mix(vec3(4.6, 0.8, 0.0), vec3(0.0, 3.5, 0.0), narrow);
  return p + home + vec3(0.0, 0.30 * sin(TAU * 0.19 * t), 0.0);
}

vec3 dragonfly(vec3 seed, float id, out float alpha, out float accent) {
  alpha = 1.0;
  accent = 0.0;

  vec3 p;
  if (id < uWingCount) {
    p = dfWing(mod(id, 4.0), floor(id / 4.0), seed, alpha, accent);
  } else if (id < uAbdomenEnd) {
    p = dfAbdomen(id - uWingCount, alpha);
  } else if (id < uThoraxEnd) {
    p = dfThorax(id - uAbdomenEnd);
  } else {
    p = dfHead(id - uThoraxEnd, uCount - uThoraxEnd, alpha);
  }

  float narrow = 1.0 - smoothstep(0.78, 1.30, uAspect);
  return dfOrient(p * mix(0.74, 0.40, narrow), narrow);
}
`;

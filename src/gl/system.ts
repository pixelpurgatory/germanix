import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { PALETTE } from "./core.ts";
import { BLEND_CENTERS, BLEND_OVERLAP } from "./states.ts";
import { PARTICLE_VERT } from "./shaders/particle.vert.glsl.ts";
import { PARTICLE_FRAG } from "./shaders/particle.frag.glsl.ts";

export type GridDims = readonly [number, number, number];

/** Instance tiers. Product of each triple is the instance count. */
export const TIER_DESKTOP: GridDims = [50, 30, 30]; // 45 000
export const TIER_COMPACT: GridDims = [30, 20, 20]; // 12 000

/** Deterministic PRNG so every build produces the identical instance set. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SystemUniforms {
  readonly [name: string]: { value: unknown };
}

/**
 * The one instanced system. Attributes are written once here and never touched
 * again — no CPU-side rewrites, no needsUpdate in the frame loop, no geometry
 * swaps. Every per-frame change travels through a uniform.
 */
export class ParticleSystem {
  readonly mesh: InstancedMesh;
  readonly material: ShaderMaterial;
  readonly count: number;

  constructor(dims: GridDims) {
    const [gx, gy, gz] = dims;
    const count = gx * gy * gz;
    this.count = count;

    const geometry = new PlaneGeometry(1, 1);
    const ids = new Float32Array(count);
    const seeds = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    const rand = mulberry32(0x9e3779b9);

    let i = 0;
    for (let z = 0; z < gz; z++) {
      for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
          const o = i * 3;
          ids[i] = i;
          grid[o] = (x + 0.5) / gx;
          grid[o + 1] = (y + 0.5) / gy;
          grid[o + 2] = (z + 0.5) / gz;
          seeds[o] = rand();
          seeds[o + 1] = rand();
          seeds[o + 2] = rand();
          i++;
        }
      }
    }

    geometry.setAttribute("aId", new InstancedBufferAttribute(ids, 1));
    geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 3));
    geometry.setAttribute("aGridCoord", new InstancedBufferAttribute(grid, 3));

    this.material = new ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uBlendCenters: { value: new Vector3(...BLEND_CENTERS) },
        uBlendOverlap: { value: BLEND_OVERLAP },
        uPointer: { value: new Vector3(0, 0, 0) },
        uPointerStrength: { value: 0 },
        uScrollVelocity: { value: 0 },
        uScanY: { value: 0 },
        uScanWidth: { value: 0.85 },
        uCount: { value: count },
        uSize: { value: 0.05 },
        uChroma: { value: 0.22 },
        uDepthFade: { value: new Vector2(12, 26) },
        uColorParticle: { value: new Color(PALETTE.text) },
        uColorAccent: { value: new Color(PALETTE.accent) },
        uOpacity: { value: 0.5 },
      },
    });

    this.mesh = new InstancedMesh(geometry, this.material, count);
    // Positions come entirely from the vertex shader, so instanceMatrix is
    // identity and the mesh is never culled against a meaningless bound.
    const im = this.mesh.instanceMatrix.array;
    for (let k = 0; k < count; k++) {
      const o = k * 16;
      im[o] = 1;
      im[o + 5] = 1;
      im[o + 10] = 1;
      im[o + 15] = 1;
    }
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
  }

  private uniform(name: string): { value: unknown } {
    const u = this.material.uniforms[name];
    if (!u) throw new Error(`unknown uniform: ${name}`);
    return u;
  }

  setNumber(name: string, value: number): void {
    this.uniform(name).value = value;
  }

  setPointer(x: number, y: number, z: number): void {
    const v = this.uniform("uPointer").value;
    if (v instanceof Vector3) v.set(x, y, z);
  }
}

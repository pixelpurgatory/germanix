import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LAYOUT_VH, smoothstep } from "./gl/states.ts";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollDriver {
  /** Smoothed page progress, 0 -> 1. The sole driver of uProgress. */
  readonly progress: number;
  /** Normalised, clamped scroll velocity, -1 -> 1. */
  readonly velocity: number;
  refresh(): void;
}

const VELOCITY_SCALE = 2600;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Maps whole-page scroll onto a single scalar. Nothing else in the app reads
 * scrollY; every state change downstream is a function of this one number.
 */
export function createScrollDriver(): ScrollDriver {
  const proxy = { p: 0 };
  let velocity = 0;

  gsap.to(proxy, {
    p: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.65,
      onUpdate: (self) => {
        velocity = clamp(self.getVelocity() / VELOCITY_SCALE, -1, 1);
      },
    },
  });

  return {
    get progress(): number {
      return clamp(proxy.p, 0, 1);
    },
    get velocity(): number {
      return velocity;
    },
    refresh(): void {
      ScrollTrigger.refresh();
    },
  };
}

/** A sticky block whose copy should be opaque only while it is pinned. */
export interface RevealTarget {
  readonly node: HTMLElement;
  readonly heightVh: number;
}

/**
 * A 140vh section with a 100vh sticky child is pinned for only 40vh, so the
 * remaining 100vh of its travel has to be covered by the fade. Wide enough
 * that consecutive sections genuinely cross over instead of leaving a stretch
 * with no copy on screen at all.
 */
const REVEAL_FADE = 0.28;

/**
 * Crossfades each sticky block's copy.
 *
 * A `height: 140vh` section with a `100vh` sticky child holds its copy centred
 * for 40vh and then slides it out under the next one. Left at full opacity two
 * headlines share the viewport at every boundary and the outgoing one clips.
 * The pinned window is computed from the same LAYOUT_VH that produced the
 * blend centres, so the copy is opaque exactly while it is pinned.
 */
export function attachReveals(targets: readonly RevealTarget[]): void {
  for (const { node, heightVh } of targets) {
    const inner = node.firstElementChild;
    if (!(inner instanceof HTMLElement)) continue;

    const travel = heightVh + LAYOUT_VH.viewport;
    const pinStart = LAYOUT_VH.viewport / travel;
    const pinEnd = heightVh / travel;

    ScrollTrigger.create({
      trigger: node,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const t = self.progress;
        const fade =
          smoothstep(pinStart - REVEAL_FADE, pinStart, t) *
          (1 - smoothstep(pinEnd, pinEnd + REVEAL_FADE, t));
        inner.style.opacity = fade.toFixed(3);
      },
    });
  }
}

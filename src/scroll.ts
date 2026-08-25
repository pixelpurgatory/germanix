import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

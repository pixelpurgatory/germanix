import "./style.css";
import { GLCore, prefersReducedMotion } from "./gl/core.ts";
import { ParticleSystem, selectTier } from "./gl/system.ts";
import { attachReveals, createScrollDriver } from "./scroll.ts";
import { createPointerDriver } from "./pointer.ts";
import { buildPage, createNavHighlighter } from "./page.ts";
import { dominantState } from "./gl/states.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#gl");
const mount = document.querySelector<HTMLElement>("#page");
if (!canvas || !mount) throw new Error("missing #gl canvas or #page mount");

const reveals = buildPage(mount);

const core = new GLCore(canvas);
const system = new ParticleSystem(selectTier());
core.scene.add(system.mesh);

const SCAN_PERIOD = 6.5;
const SCAN_TRAVEL = 11.0;
const VELOCITY_FOLLOW = 0.12;

if (prefersReducedMotion()) {
  // Static state A: uProgress pinned to 0, no scroll morph, one frame then stop.
  system.setNumber("uProgress", 0);
  system.setNumber("uScanY", 0);
  system.setNumber("uAspect", core.camera.aspect);
  core.renderOnce();
} else {
  const setActiveNav = createNavHighlighter();
  // State 0 is the dragonfly, which owns the hero and has no nav entry, so the
  // four listed practices sit one index behind the state list.
  const scroll = createScrollDriver((p) => setActiveNav(dominantState(p) - 1));
  const pointer = createPointerDriver(core.camera);
  attachReveals(reveals);
  let velocity = 0;

  core.onFrame((elapsed) => {
    pointer.update();
    velocity += (scroll.velocity - velocity) * VELOCITY_FOLLOW;

    system.setNumber("uTime", elapsed);
    system.setNumber("uAspect", core.camera.aspect);
    system.setNumber("uProgress", scroll.progress);
    system.setNumber("uScrollVelocity", velocity);
    system.setNumber("uPointerStrength", pointer.strength);
    system.setPointer(pointer.point.x, pointer.point.y, pointer.point.z);
    system.setNumber("uScanY", (1 - ((elapsed / SCAN_PERIOD) % 1)) * SCAN_TRAVEL - SCAN_TRAVEL * 0.5);
  });

  core.start();
}

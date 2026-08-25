import "./style.css";
import { GLCore, prefersReducedMotion } from "./gl/core.ts";
import { ParticleSystem, selectTier } from "./gl/system.ts";
import { createScrollDriver } from "./scroll.ts";
import { createPointerDriver } from "./pointer.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#gl");
if (!canvas) throw new Error("missing #gl canvas");

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
  core.renderOnce();
} else {
  const scroll = createScrollDriver();
  const pointer = createPointerDriver(core.camera);
  let velocity = 0;

  core.onFrame((elapsed) => {
    pointer.update();
    velocity += (scroll.velocity - velocity) * VELOCITY_FOLLOW;

    system.setNumber("uTime", elapsed);
    system.setNumber("uProgress", scroll.progress);
    system.setNumber("uScrollVelocity", velocity);
    system.setNumber("uPointerStrength", pointer.strength);
    system.setPointer(pointer.point.x, pointer.point.y, pointer.point.z);
    system.setNumber("uScanY", (1 - ((elapsed / SCAN_PERIOD) % 1)) * SCAN_TRAVEL - SCAN_TRAVEL * 0.5);
  });

  core.start();
}

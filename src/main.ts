import "./style.css";
import { GLCore } from "./gl/core.ts";
import { ParticleSystem, TIER_DESKTOP } from "./gl/system.ts";
import { createScrollDriver } from "./scroll.ts";
import { createPointerDriver } from "./pointer.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#gl");
if (!canvas) throw new Error("missing #gl canvas");

const core = new GLCore(canvas);
const system = new ParticleSystem(TIER_DESKTOP);
core.scene.add(system.mesh);

const scroll = createScrollDriver();
const pointer = createPointerDriver(core.camera);

const SCAN_PERIOD = 6.5;
const SCAN_TRAVEL = 11.0;
let velocity = 0;

core.onFrame((elapsed) => {
  pointer.update();
  velocity += (scroll.velocity - velocity) * 0.12;

  system.setNumber("uTime", elapsed);
  system.setNumber("uProgress", scroll.progress);
  system.setNumber("uScrollVelocity", velocity);
  system.setNumber("uPointerStrength", pointer.strength);
  system.setPointer(pointer.point.x, pointer.point.y, pointer.point.z);
  system.setNumber("uScanY", (1 - ((elapsed / SCAN_PERIOD) % 1)) * SCAN_TRAVEL - SCAN_TRAVEL * 0.5);
});

core.start();

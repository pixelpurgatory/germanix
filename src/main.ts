import "./style.css";
import { GLCore } from "./gl/core.ts";
import { ParticleSystem, TIER_DESKTOP } from "./gl/system.ts";
import { createScrollDriver } from "./scroll.ts";

const canvas = document.querySelector<HTMLCanvasElement>("#gl");
if (!canvas) throw new Error("missing #gl canvas");

const core = new GLCore(canvas);
const system = new ParticleSystem(TIER_DESKTOP);
core.scene.add(system.mesh);

const scroll = createScrollDriver();

let velocity = 0;

core.onFrame((elapsed) => {
  velocity += (scroll.velocity - velocity) * 0.12;
  system.setNumber("uTime", elapsed);
  system.setNumber("uProgress", scroll.progress);
  system.setNumber("uScrollVelocity", velocity);
});

core.start();

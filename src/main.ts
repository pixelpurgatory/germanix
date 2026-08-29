import "./style.css";
import { GLCore, prefersReducedMotion } from "./gl/core.ts";
import { ParticleSystem, selectTier } from "./gl/system.ts";
import { attachReveals, createScrollDriver, refreshScroll } from "./scroll.ts";
import { createPointerDriver } from "./pointer.ts";
import { buildPage, createNavHighlighter } from "./page.ts";
import { mountPanels } from "./panels.ts";
import { applyDocumentLocale, onLocaleChange } from "./locale.ts";
import { dominantState } from "./gl/states.ts";

const canvasEl = document.querySelector<HTMLCanvasElement>("#gl");
const mountEl = document.querySelector<HTMLElement>("#page");
if (!canvasEl || !mountEl) throw new Error("missing #gl canvas or #page mount");

// Rebound so the narrowing survives into render(), which runs on every
// language switch rather than once at startup.
const canvas = canvasEl;
const mount = mountEl;

const SCAN_PERIOD = 6.5;
const SCAN_TRAVEL = 11.0;
const VELOCITY_FOLLOW = 0.12;

const reduced = prefersReducedMotion();
const core = new GLCore(canvas);
const system = new ParticleSystem(selectTier());
core.scene.add(system.mesh);

// Mutable slots, because the scroll driver and the GL loop outlive a language
// switch and have to keep reaching the freshly built DOM.
let disposeReveals: (() => void) | null = null;
let setActiveNav: (index: number) => void = () => {};

/**
 * Builds the whole document. Re-run on a language switch, which is why the
 * old reveal triggers are killed first and the scroll offset is restored: the
 * layout is identical between locales, only the words change.
 */
function render(): void {
  const offset = window.scrollY;
  disposeReveals?.();

  const targets = buildPage(mount);
  mountPanels(mount);
  setActiveNav = createNavHighlighter();
  if (!reduced) disposeReveals = attachReveals(targets);

  refreshScroll();
  window.scrollTo(0, offset);
}

applyDocumentLocale();
render();

if (reduced) {
  // Static dragonfly: uProgress pinned to 0, no scroll morph, one frame.
  system.setNumber("uProgress", 0);
  system.setNumber("uScanY", 0);
  system.setNumber("uAspect", core.camera.aspect);
  core.renderOnce();
} else {
  const scroll = createScrollDriver((p) => setActiveNav(dominantState(p) - 1));
  const pointer = createPointerDriver(core.camera);
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

onLocaleChange(render);

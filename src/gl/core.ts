import { Clock, Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

/** The six approved values. Nothing else is allowed on screen. */
export const PALETTE = {
  base: "#0A0A0B",
  surface: "#141416",
  hairline: "#26262A",
  muted: "#8A8A93",
  text: "#EDEDEF",
  accent: "#C4B5A0",
} as const;

export type FrameCallback = (elapsed: number, delta: number) => void;

const RESIZE_DEBOUNCE_MS = 140;

/** Adaptive quality: rolling window, threshold and the render scale ladder. */
const FRAME_WINDOW = 60;
const SLOW_FRAME_MS = 20;
const RENDER_SCALES: readonly number[] = [1, 0.75, 0.6];

/** Ignore absurd deltas (tab resume, breakpoint) instead of animating through them. */
const MAX_DELTA = 0.1;

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The single renderer, camera and RAF loop for the whole page.
 *
 * Built once in the constructor and never rebuilt. Resizing and quality
 * changes touch the camera projection and the drawing buffer only — the WebGL
 * context is never disposed or recreated.
 */
export class GLCore {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;

  private readonly clock = new Clock(false);
  private readonly frameCallbacks: FrameCallback[] = [];
  private rafId = 0;
  private resizeTimer = 0;
  private loopRequested = false;

  private elapsed = 0;
  private renderScale = 1;
  private qualityTier = 0;
  private frameSamples = 0;
  private frameAccumMs = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(new Color(PALETTE.base), 1);

    // Deliberately off-axis: dead-centre, the lattice and the 4x2x4 array both
    // resolve into mirror-symmetric targets rather than reading as objects.
    this.camera = new PerspectiveCamera(38, 1, 0.1, 160);
    this.camera.position.set(3.1, 1.7, 22);
    this.camera.lookAt(0, 0, 0);

    this.applySize();
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  onFrame(cb: FrameCallback): void {
    this.frameCallbacks.push(cb);
  }

  start(): void {
    this.loopRequested = true;
    if (!document.hidden) this.resume();
  }

  stop(): void {
    this.loopRequested = false;
    this.suspend();
  }

  /** Render exactly one frame without starting the loop (reduced-motion path). */
  renderOnce(): void {
    this.runFrame(0);
  }

  /** The only requestAnimationFrame call site in the app. */
  private schedule(): void {
    this.rafId = requestAnimationFrame(this.tick);
  }

  private readonly tick = (): void => {
    this.schedule();
    this.runFrame(this.clock.getDelta());
  };

  private resume(): void {
    if (this.rafId !== 0) return;
    if (!this.clock.running) this.clock.start();
    this.schedule();
  }

  private suspend(): void {
    if (this.rafId === 0) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** visibilitychange: stop the RAF loop when hidden, resume on return. */
  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.suspend();
    else if (this.loopRequested) this.resume();
  };

  private runFrame(rawDelta: number): void {
    const delta = Math.min(rawDelta, MAX_DELTA);
    this.elapsed += delta;
    for (const cb of this.frameCallbacks) cb(this.elapsed, delta);
    this.renderer.render(this.scene, this.camera);
    if (rawDelta > 0) this.sampleFrame(rawDelta * 1000);
  }

  /**
   * Adaptive quality. Averages frame time over a rolling 60-frame window and
   * steps the render scale down (1 -> 0.75 -> 0.6) whenever the window
   * averages slower than 20 ms. Downgrade only: re-upgrading on a recovered
   * window is how these controllers end up oscillating.
   */
  private sampleFrame(frameMs: number): void {
    if (frameMs > MAX_DELTA * 1000) return; // resume spike, not a real frame
    this.frameAccumMs += frameMs;
    this.frameSamples++;
    if (this.frameSamples < FRAME_WINDOW) return;

    const average = this.frameAccumMs / this.frameSamples;
    this.frameAccumMs = 0;
    this.frameSamples = 0;

    if (average <= SLOW_FRAME_MS) return;
    if (this.qualityTier >= RENDER_SCALES.length - 1) return;

    this.qualityTier++;
    this.renderScale = RENDER_SCALES[this.qualityTier] ?? 0.6;
    this.applySize();
  }

  /** Camera + drawing buffer only. Never disposes, never rebuilds the context. */
  private applySize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      Math.max(1, Math.round(w * this.renderScale)),
      Math.max(1, Math.round(h * this.renderScale)),
      false,
    );
  }

  /** Debounced resize. Camera + renderer resize only. */
  private readonly onResize = (): void => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this.applyDebouncedSize, RESIZE_DEBOUNCE_MS);
  };

  private readonly applyDebouncedSize = (): void => {
    this.applySize();
  };
}

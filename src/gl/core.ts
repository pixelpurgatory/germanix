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

/**
 * The single renderer, camera and RAF loop for the whole page.
 *
 * Built once in the constructor and never rebuilt. Resizing touches the camera
 * projection and the renderer drawing buffer only — the WebGL context is never
 * disposed or recreated.
 */
export class GLCore {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;

  private readonly clock = new Clock(false);
  private readonly frameCallbacks: FrameCallback[] = [];
  private rafId = 0;
  private resizeTimer = 0;
  private renderScale = 1;

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

    this.camera = new PerspectiveCamera(38, 1, 0.1, 160);
    this.camera.position.set(0, 0, 22);

    this.applySize();
    window.addEventListener("resize", this.onResize, { passive: true });
  }

  onFrame(cb: FrameCallback): void {
    this.frameCallbacks.push(cb);
  }

  start(): void {
    if (this.rafId !== 0) return;
    if (!this.clock.running) this.clock.start();
    this.schedule();
  }

  stop(): void {
    if (this.rafId === 0) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Render exactly one frame without starting the loop. */
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

  private runFrame(delta: number): void {
    const elapsed = this.clock.getElapsedTime();
    for (const cb of this.frameCallbacks) cb(elapsed, delta);
    this.renderer.render(this.scene, this.camera);
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

  private readonly onResize = (): void => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this.applyDebouncedSize, RESIZE_DEBOUNCE_MS);
  };

  private readonly applyDebouncedSize = (): void => {
    this.applySize();
  };
}

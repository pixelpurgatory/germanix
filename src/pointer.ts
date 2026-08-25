import { Plane, Raycaster, Vector2, Vector3 } from "three";
import type { PerspectiveCamera } from "three";

/**
 * Pointer -> world position.
 *
 * The ray is intersected against a single invisible proxy plane at z = 0.
 * The instanced mesh is never a raycast target — it has 45k shader-driven
 * instances whose CPU-side transforms are all identity, so raycasting it would
 * be both meaningless and ruinously slow.
 */
const PROXY_PLANE = new Plane(new Vector3(0, 0, 1), 0);

const IDLE_MS = 900;
const FOLLOW = 0.09;

export interface PointerDriver {
  readonly point: Vector3;
  readonly strength: number;
  /** Called once per frame from the single RAF loop. */
  update(): void;
}

export function createPointerDriver(camera: PerspectiveCamera): PointerDriver {
  const raycaster = new Raycaster();
  const ndc = new Vector2(0, 0);
  const target = new Vector3(0, 0, 0);
  const point = new Vector3(0, 0, 0);
  let strength = 0;
  let lastMove = 0;
  let seen = false;

  const onMove = (event: PointerEvent): void => {
    ndc.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
    lastMove = performance.now();
    seen = true;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });

  return {
    point,
    get strength(): number {
      return strength;
    },
    update(): void {
      if (seen) {
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(PROXY_PLANE, target) === null) return;
      }
      point.lerp(target, FOLLOW);
      const idle = performance.now() - lastMove > IDLE_MS;
      const wanted = seen && !idle ? 1 : 0;
      strength += (wanted - strength) * 0.06;
    },
  };
}

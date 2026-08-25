# Hard constraints — never violate

- ONE WebGLRenderer, ONE canvas, ONE RAF loop. Created at init, never rebuilt.
- Resize = camera + renderer resize only. Never dispose, never recreate context.
- Instance attributes uploaded once at init. Zero per-frame CPU attribute writes.
- Four visual states are vertex-shader position functions blended by a single
  uniform float uProgress. No geometry swaps, no hard cuts, no state machine.
- State C liquid effect = per-instance fresnel RGB offset in fragment shader.
  Never a second mesh, never a transmission material.
- Never raycast the instanced mesh. Proxy plane only.
- No external assets. No default Three.js materials.
- Tailwind v3.4.x. Do not upgrade to v4.
- Palette: #0A0A0B #141416 #26262A #8A8A93 #EDEDEF, accent #C4B5A0. No other hues.
- All copy lives in src/content.ts.

Gates: `npx tsc --noEmit`, `npm run build`, and `scripts/check-blend.ts`
must all pass before any phase is considered complete.

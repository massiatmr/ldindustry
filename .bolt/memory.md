# Project memory

## Product intent & audience

- Web app featuring a homepage and a 3D showroom (product/visual showcase).
- Project migrated from Lovable to Bolt New in standard Vite mode; must run fully independently of Lovable.

## Brand personality & voice

- Not yet inferred from available context.

## Visual design & UX direction

- Homepage + dedicated 3D showroom page/view.
- Static image assets and a 3D model asset are part of the project and must load correctly without external platform dependencies.
- 3D model rendering is a core UX feature.

## Decisions, constraints & rationale

- Framework: Vite + React.
- Migration target: Bolt New standard Vite (no Lovable dependency).
- Package install required a specific package-manager flag to resolve a prior lockstate/manager issue; reinstall locally when packages are missing in a fresh session.
- Code-style/lint control is enforced and must pass with zero errors; existing HMR-related warnings (≈9) are tolerated and have no runtime/display impact.
- Final verification gates: build compiles, 5 tests pass, lint/style passes (warnings only).

## Open questions & assumptions

- 3D rendering library/model format not yet confirmed (e.g., three.js / react-three-fiber, .glb/.gltf).
- Specific product domain or audience for the showroom unknown.
- Package manager in use (npm/pnpm/yarn) not explicitly confirmed.
- Brand voice, color system, and typography details still to be established.
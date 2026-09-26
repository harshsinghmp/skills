# technical-diagrams — Animated Moving SVG Technical & Architecture Diagrams

## Scope

- Generation of animated, moving technical diagrams for software architectures, request journeys, CI/CD pipelines, and infrastructure topologies.
- Native, dependency-free SVG/HTML output using SVG `stroke-dashoffset` flowing dashed connectors and `animateMotion` traveling packet dots.
- Zero client-side JavaScript or external libraries required (<10KB standalone payload).
- Seamless embedding into Astro (`.astro`), Next.js (`.tsx`), and Markdown/MDX documentation.

## Deliverable

A single, self-contained SVG or HTML snippet containing styled vector elements, semantic component colors, smooth looping CSS animations, and animated request paths.

## Two Core Visualization Modes

### 1. Flow Mode (Pipelines, Workflows, & State Machines)
- **Use When**: Visualizing CI/CD pipelines, sequential checkout flows, multi-step agent loops, or state transitions.
- **Visual Behavior**: Dashed connector paths stream in the direction of execution from START to END through parallel branches and joins.
- **Color Semantics**:
  - `Neutral Grey/Slate`: Default execution path.
  - `Accent Cyan/Indigo`: Active running pipeline stage.
  - `Success Emerald`: Completed/approved transition.
  - `Failure Rose`: Error/rollback branch.

### 2. Architecture Mode (Systems, Topology, & Request Journeys)
- **Use When**: Visualizing microservices platforms, cloud infrastructure, database clusters, and API gateways.
- **Visual Behavior**: Glowing light dots travel along connection paths like live network packets (e.g. client → ingress → payment service → database and back).
- **Component Legend**:
  - Ingress / API Gateway: High-contrast entry boundary.
  - Core Services: Distinct modular containers with namespace tags.
  - Data Stores: Database cylinder vectors with distinct storage tint.
  - Event Bus / Queue: Horizontal ribbon with flowing packet dots.

## Technical Implementation Pattern (Zero Runtime Dependencies)

### Flowing Stream Connector (Pure CSS)
```html
<path d="M 50,100 L 250,100" 
      stroke="#38bdf8" 
      stroke-width="2" 
      stroke-dasharray="6,6" 
      class="flowing-path" />

<style>
  @keyframes flow {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }
  .flowing-path {
    animation: flow 1.2s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .flowing-path { animation: none; stroke-dasharray: none; }
  }
</style>
```

### Traveling Request Packet (`animateMotion`)
```html
<circle r="3.5" fill="#38bdf8" filter="url(#glow)">
  <animateMotion 
    path="M 50,100 L 250,100" 
    dur="2s" 
    repeatCount="indefinite" 
    keyPoints="0;1" 
    keyTimes="0;1" />
</circle>
```

## Quality Gate

- [ ] Single self-contained SVG/HTML with zero external runtime JavaScript.
- [ ] Strictly respects `prefers-reduced-motion` media query (disables motion gracefully for accessibility).
- [ ] Total SVG payload remains under 15KB.
- [ ] Text labels remain crisp and legible in both light and dark themes.
- [ ] Request packet animations clearly indicate direction of data flow.

## Routing

- Interactive UI components and Framer Motion / Motion.dev code → `animate` (build mode).
- Full brand design system color tokens and typography → `designsystem`.
- High-level project requirements and architecture documents → `webdev` / `new-project`.

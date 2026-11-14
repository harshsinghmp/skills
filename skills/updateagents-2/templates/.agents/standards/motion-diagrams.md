# 🎬 Animated Technical Diagrams Standard (Zero-JS SVG)

> **Jasper Creative Rail**: Standards for creating animated system architectures and dataflow diagrams with pure CSS and zero JavaScript dependencies.

---

## 1. Zero-JS Animation Principle

All interactive documentation and web diagram surfaces should leverage **pure SVG + CSS keyframes**:
- Zero JavaScript overhead.
- Flawless native rendering in GitHub markdown previews, documentation portals, and static HTML.
- Crisp vector scaling on high-DPI displays with minimal token size.

---

## 2. Animated Flow Pattern

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="100%" height="100%">
  <style>
    @keyframes pulseFlow {
      0% { stroke-dashoffset: 40; }
      100% { stroke-dashoffset: 0; }
    }
    .flow-line {
      stroke: #3b82f6;
      stroke-width: 2.5;
      stroke-dasharray: 6, 6;
      animation: pulseFlow 1.5s linear infinite;
    }
    .node-box {
      fill: #1e293b;
      stroke: #475569;
      stroke-width: 1.5;
      rx: 8;
    }
    .label {
      fill: #f8fafc;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-anchor: middle;
      dominant-baseline: middle;
    }
  </style>
  
  <!-- Nodes & Connector -->
  <rect class="node-box" x="50" y="70" width="160" height="60" />
  <text class="label" x="130" y="100">Client Request</text>

  <path class="flow-line" d="M 210 100 L 390 100" />

  <rect class="node-box" x="390" y="70" width="160" height="60" />
  <text class="label" x="470" y="100">Gateway Rail</text>
</svg>
```

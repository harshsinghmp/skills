# 🌐 animate:threejs — Three.js, WebGL & 3D Interactive Graphics

Complete playbook for high-performance 3D web experiences, creative WebGL moments, PBR materials, custom GLSL shaders, GLTF/Draco asset pipelines, and GPU memory lifecycle management.

---

## 1. When to Use

- **Real 3D Interactive UI**: Product configurators, 3D showcases, hero visual anchors, interactive globes/data-viz, cursor-driven particle systems, and creative landing page centerpieces.
- **When NOT to use**: Simple 2.5D card tilts, isometric illustrations, or hover skews (use CSS `perspective` / `transform` instead); decorative animations that can be done with Motion or SVG; unoptimized mobile sites with tight LCP budgets.
- **Rule of Thumb**: 3D must serve brand storytelling or user comprehension. Never block critical user actions or slow time-to-interactive (TTI).

---

## 2. Architecture & Decision Matrix

| Stack | Best For | Learning Curve | Control | Bundle Impact |
|:---|:---|:---|:---|:---|
| **Vanilla Three.js** | Maximum control, framework-agnostic, micro-interactions, canvas overlays | High | Maximum | ~150KB min/gzip (tree-shaken) |
| **React Three Fiber (R3F)** | React/Next.js apps, componentized scenes, complex declarative state | Medium | High | ~180KB min/gzip |
| **Globe.GL** | 3D geospatial data, flight paths, points/heatmaps, global network activity | Low | Focused | ~220KB min/gzip |
| **Spline / WebGPU Shaders** | Quick designer-authored 3D or pure halftone/flow shader trails | Low | Curated | External embed or WebGPU gate |

### Decision Flow:
```
Need 3D Experience?
├── Geospatial / World Map Data? ─────────────► Globe.GL
├── React / Next.js with deep UI state? ──────► React Three Fiber (@react-three/fiber + drei)
├── Framework-agnostic / Canvas overlay? ─────► Vanilla Three.js
└── Halftone cursor trail / mouse fluid? ────► Custom GLSL / Shaders Layer
```

---

## 3. Core Engine Lifecycle (Vanilla Three.js)

### Production-Ready Setup Pattern

```typescript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private isVisible = true;

  constructor(container: HTMLElement, enableControls = false) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Graph
    this.scene = new THREE.Scene();

    // 2. Camera: FOV, Aspect, Near, Far (keep near as high as possible to prevent z-fighting)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2, 5);

    // 3. WebGLRenderer with optimal defaults
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // Only enable MSAA if DPR < 2 for perf
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(width, height);
    // Strict DPR cap (never exceed 2 to prevent GPU thermal throttling on retina screens)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    if (enableControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enableZoom = false; // Prevent trapping page scroll
    }

    // 4. Responsive Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    // 5. Visibility / Offscreen Pause Gate
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries[0]?.isIntersecting ?? false;
    });
    this.intersectionObserver.observe(this.container);

    this.start();
  }

  private handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (!this.isVisible) return; // Pause GPU loop when scrolled out of view

    const delta = this.clock.getDelta();
    this.controls?.update();

    // Hook custom updates here
    this.render(delta);
  };

  protected render(_delta: number) {
    this.renderer.render(this.scene, this.camera);
  }

  public start() {
    if (!this.animationFrameId) this.animate();
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // 6. Complete Memory Disposal (Zero Memory Leaks)
  public dispose() {
    this.stop();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.controls?.dispose();

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
```

---

## 4. Materials, Lighting & PBR (Physically Based Rendering)

### Material Hierarchy & Use Cases

1. **`MeshBasicMaterial`**: Unlit, zero lighting calculation overhead. Best for wireframes, background gradient cards, billboard sprites, and debug visuals.
2. **`MeshStandardMaterial`**: Standard PBR using metallic-roughness workflow.
   - `roughness`: 0.0 (mirror-smooth) to 1.0 (chalk-matte).
   - `metalness`: 0.0 (dielectric/plastic/wood) or 1.0 (pure conductive metal). Avoid mid values like 0.5 except for dust/oxidation.
   - `map`: Base color / albedo. Must use `texture.colorSpace = THREE.SRGBColorSpace`.
   - `normalMap`: Tangent-space surface normals. Must use `texture.colorSpace = THREE.NoColorSpace`.
   - `roughnessMap`, `metalnessMap`, `aoMap`: Linear color space (`THREE.NoColorSpace`).
3. **`MeshPhysicalMaterial`**: Advanced PBR extension for luxury / hero glass and physical materials:
   - `transmission`: 0.0 to 1.0 (for true transmissive glass/acrylic).
   - `thickness`: Volumetric depth for light refraction.
   - `ior`: Index of Refraction (1.5 for glass, 1.333 for water, 2.417 for diamond).
   - `clearcoat` & `clearcoatRoughness`: Secondary glossy lacquer coat (car paint, varnished carbon).
   - `sheen` & `sheenColor`: Soft velvet/fabric micro-fiber reflections.

### PBR Environment Map & Lighting Setup

```typescript
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export function setupStudioLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  // Key Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.bias = -0.0001; // Prevent shadow acne
  scene.add(keyLight);

  // Soft Ambient Fill
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // High-Dynamic Range (HDR) Environment Reflection
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/textures/studio_small.hdr', (hdrTexture) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrTexture; // Lights all PBR materials with real reflections
    // Optional: scene.background = hdrTexture;
  });
}
```

---

## 5. High-Performance Geometries & Instancing

Rendering 5,000 separate `THREE.Mesh` objects destroys frame rates due to 5,000 CPU-to-GPU draw calls. Use `THREE.InstancedMesh` to render tens of thousands of instances in a single draw call.

### InstancedMesh Pattern

```typescript
export function createParticleField(scene: THREE.Scene, count = 2000) {
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness: 0.8,
  });

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const scale = Math.random() * 0.5 + 0.5;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.setColorAt(i, color.setHSL(i / count, 0.7, 0.5));
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
  scene.add(instancedMesh);
  return instancedMesh;
}
```

---

## 6. GLTF & Draco 3D Asset Pipeline

### Optimization Rules Before Loading
1. **Target Budget**: Keep web 3D models < 3MB (ideal < 1.5MB).
2. **Mesh Optimization**: Max 50,000–100,000 triangles for mobile; bake complex high-poly normals into low-poly meshes.
3. **Draco Compression**: Compresses geometry by 80–90% using Google Draco.
4. **Command-line Compression**:
   ```bash
   npx @gltf-transform/cli optimize input.glb output.glb --compress draco --texture-compress webp
   ```

### Loading with Progress & Draco Support

```typescript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function loadOptimizedGLTF(
  url: string,
  onProgress?: (percent: number) => void
): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const manager = new THREE.LoadingManager();
    if (onProgress) {
      manager.onProgress = (_item, loaded, total) => {
        onProgress(Math.round((loaded / total) * 100));
      };
    }

    const gltfLoader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      url,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        dracoLoader.dispose();
        resolve(gltf.scene);
      },
      undefined,
      (error) => reject(error)
    );
  });
}
```

---

## 7. Custom GLSL Shaders & Interactive Cursor Trails

For hero backgrounds, wave distortions, liquid ripples, or cursor-following halftone trails.

### Vertex + Fragment ShaderMaterial Pattern

```typescript
import * as THREE from 'three';

export function createInteractiveShaderMesh(): THREE.Mesh {
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color('#0a0a14') },
    uColorB: { value: new THREE.Color('#6366f1') },
  };

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      // Procedural wave displacement reacting to mouse distance
      float dist = distance(uv, uMouse);
      float wave = sin(modelPosition.x * 4.0 + uTime * 2.0) * cos(modelPosition.z * 4.0 + uTime * 2.0);
      float mouseImpact = smoothstep(0.4, 0.0, dist) * 0.3;
      
      modelPosition.y += wave * 0.2 + mouseImpact;
      vElevation = modelPosition.y;

      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    void main() {
      float mixStrength = (vElevation + 0.2) * 2.5;
      vec3 color = mix(uColorA, uColorB, clamp(mixStrength, 0.0, 1.0));
      
      // Halftone dot overlay
      vec2 grid = fract(vUv * 40.0) - 0.5;
      float dotMask = step(length(grid), 0.25);
      color += dotMask * 0.1;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: false,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(6, 6, 64, 64);
  geometry.rotateX(-Math.PI / 2);

  return new THREE.Mesh(geometry, material);
}
```

---

## 8. Post-Processing Pipeline (EffectComposer)

```typescript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function setupPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): EffectComposer {
  const composer = new EffectComposer(renderer);

  // 1. Base Scene Render
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. Selective Glow / Bloom (Only if device is desktop / high-end)
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.6,  // strength
      0.4,  // radius
      0.85  // threshold (only highlights glow)
    );
    composer.addPass(bloomPass);
  }

  // 3. OutputPass: Mandatory in modern Three.js for correct tone mapping & sRGB output
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return composer;
}
```

---

## 9. React Three Fiber (R3F) Modern Standard

When working in React or Next.js, use `@react-three/fiber` and `@react-three/drei`:

```tsx
'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

function LoadingFallback() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-full bg-black/80 px-4 py-2 text-xs font-mono text-white backdrop-blur">
        Loading 3D {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function ProductModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive ref={meshRef} object={scene} scale={1.2} />
    </Float>
  );
}

export function ProductCanvas({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="relative h-[500px] w-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        dpr={[1, 2]} // Cap DPR automatically
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <Suspense fallback={<LoadingFallback />}>
          <ProductModel url={modelUrl} />
          <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={10} blur={2} far={4} />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
```

---

## 10. 3D Globe Visualization (Globe.GL)

When visualizing global client activity, server clusters, or shipping routes:

```typescript
import Globe from 'globe.gl';

export function initGlobalTrafficGlobe(container: HTMLElement, points: Array<{ lat: number; lng: number; size: number; color: string }>) {
  const globe = new Globe(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .pointsData(points)
    .pointAltitude('size')
    .pointColor('color')
    .pointRadius(0.25)
    .pointsMerge(true) // Crucial performance win: merges all points into single BufferGeometry
    .atmosphereColor('#6366f1')
    .atmosphereAltitude(0.25);

  // Auto-rotate
  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.6;
  globe.controls().enableZoom = false; // Never trap document scroll

  return globe;
}
```

---

## 11. Performance, Accessibility & Fallback Guardrails

### 🛡️ Non-Negotiable 3D Quality Gates
1. **`prefers-reduced-motion` Contract**:
   ```typescript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (prefersReducedMotion) {
     // Freeze auto-rotation, eliminate camera fly-throughs, render static single frame
   }
   ```
2. **Screen Reader Accessibility & Semantic HTML**:
   - The `<canvas>` element MUST be paired with `aria-hidden="true"`.
   - Always place real semantic HTML (headings, copy, interactive buttons, alt-text descriptions) in front of or beside the canvas.
   - Example:
     ```html
     <section class="relative isolate overflow-hidden">
       <!-- 3D Canvas layer behind -->
       <div id="three-canvas-container" class="absolute inset-0 -z-10" aria-hidden="true"></div>
       <!-- Accessible Content layer above -->
       <div class="relative z-10 mx-auto max-w-4xl">
         <h1>Real-Time Global Infrastructure</h1>
         <p>Interactive 3D visualization showing 48 edge datacenters worldwide.</p>
       </div>
     </section>
     ```
3. **Hardware & Capability Fallback**:
   - Always check for WebGL support: `renderer.capabilities.isWebGL2`. If false or context creation fails, replace canvas with a high-fidelity WebP/AVIF hero image.
4. **Frame-Rate Governor**:
   - Never run unthrottled loops in background tabs. Hook into `document.addEventListener('visibilitychange')` to cancel RAF when document is hidden.
   - Use `IntersectionObserver` to pause when the container is outside the viewport.

# 🚀 Tech Stack Directions & Architectural Standards

All digital products and application builds are scaffolded via the **Intent-First Configurator** (`new-project` / Agent Engine). Every project selects an intent, framework, styling companion, animation layer, CMS, e-commerce engine, and database. All packages strictly resolve to `@latest`.

---

## 🎯 Intent-First Architecture Matrix

| Intent Category | Primary Frameworks | Recommended Styling | Recommended CMS / Commerce | Database & Backend |
| :--- | :--- | :--- | :--- | :--- |
| **Brochure & Static Site** | Astro v7 / Instatic HTML | Hybrid (UnoCSS Wind 4 + BEM) | Aria Builder / None | None / SQLite |
| **Content / Publication** | Astro v7 / Next.js 16 / Bedrock | Hybrid (UnoCSS Wind 4 + BEM) | Tina CMS / StudioCMS / Keystatic / Atomic Payload | SQLite / Turso / Neon |
| **E-Commerce Storefront** | Next.js 16 / Astro v7 | Hybrid (UnoCSS Wind 4 + BEM) | Payload CMS / Medusa v2 / Fastrr | PostgreSQL (Neon / Supabase) |
| **Web App / SaaS** | Next.js 16 | Hybrid (UnoCSS Wind 4 + BEM) | Payload + Puck / Keystone | Supabase / Neon + Better Auth |
| **Mobile App** | React Native (Expo `@latest`) | NativeWind / StyleSheet | Headless API / Strapi | Supabase / PostgreSQL |
| **DOX Governance Only** | Any (Language Agnostic) | Project Native | Project Native | Project Native |

---

## 🧭 Direction 1: Modern Web & High-Performance Astro

> **Best For**: High-speed marketing platforms, content ecosystems, portals, and interactive agency web applications.

### Core Toolchain & Stack
- **Framework**: **Astro v7.x (`@latest`)** (Server-first, content collections, hybrid rendering)
- **Zero-JS Invariant**: Pure static HTML with 0kB JavaScript baseline by default. Interactive dynamic islands are strictly implemented using **React** (`@astrojs/react@latest` with `client:*` directives).
- **Styling**: **Hybrid Engine** (UnoCSS with `@unocss/preset-wind4` + Custom Semantic BEM with native OKLCH design tokens).
- **Animations**: **Hardware-Accelerated CSS Presets** (`.fade-in`, `.slide-up`, `.stagger-group`, `.reveal-on-scroll`, `.hover-lift`) or **Motion.dev** (`motion@latest`).
- **State Management**: **Nano Stores (`nanostores@latest`)** — Sub-1KB framework-agnostic reactive store for sharing state across Astro islands (React, Vue, Svelte, vanilla JS) with zero bundle bloat.
- **Mobile Conversion**: **Ionic Capacitor (`@capacitor/cli@latest`)** — Wrap high-performance Astro web deliverables into native iOS and Android APK binaries.
- **CMS & Visual Builders**:
  - **Aria Builder** (`ariabuilder.io`): Astro-native visual builder #1 choice.
  - **StudioCMS**: Astro-native headless CMS (Astro DB / LibSQL / Turso).
  - **WollyCMS**: Self-hosted headless CMS for Astro (`@wollycms/astro` integration, SQLite/Postgres).
  - **Git-Based Headless**: Tina CMS, Keystatic, Decap CMS.
- **E-Commerce Companions**: Fastrr (1-click checkout), Razorpay, Stripe Hosted, Medusa v2, or Payload CMS.
- **Testing**: **Vitest** (Unit, component, and utility tests).
- **Runtime & Deployment**: **`@astrojs/cloudflare`** on Cloudflare Free Tier or GitHub Pages.

---

## ⚡ Direction 2: Instatic (Pure HTML / Brochure & Static Sites)

> **Best For**: Pure HTML brochure sites, lightweight marketing landing pages, and zero-JS static client deliverables.

### Core Toolchain & Stack
- **Engine**: **[Instatic](https://github.com/corebunch/instatic)** — Pure HTML-based static site generator.
- **Styling**: Custom Semantic BEM CSS tokens with OKLCH palette (`reset.css`, `tokens.css`, `semantic.css`).
- **Animations**: Pure hardware-accelerated CSS animations (`animations.css`).
- **Mobile Packaging**: Optional **Ionic Capacitor** wrapper for generating standalone Android APK and iOS apps from static HTML.
- **Delivery**: Semantic HTML5, CSS3, minimal vanilla JS.
- **Hosting**: Cloudflare Pages / GitHub Pages (Zero compute overhead, sub-millisecond TTFB).
- **Principle**: Zero runtime dependencies, 100/100 Lighthouse performance score by default.

---

## 🛍️ Direction 3: Headless E-Commerce & Dynamic Next.js

> **Best For**: Direct-to-Consumer (D2C) e-commerce brands, high-scale digital stores, and content-managed portals.

### Core Toolchain & Stack
- **Frontend Framework**: **Next.js 16 (`@latest`)** (React 19, App Router, Server Components & Server Actions by default).
- **Styling Engine**: **Hybrid Engine** (UnoCSS `@unocss/preset-wind4` + Custom Semantic BEM).
- **Animations**: **Motion.dev (`motion@latest`)** or **GSAP (`gsap@latest` + ScrollTrigger)** for high-fps zero-lag experiences.
- **State Management**: **Nano Stores** or lightweight atomic stores for micro-interactions without massive client hydration.
- **CMS & Builders**:
  - **Payload CMS (`@latest`)**: Full-stack TypeScript headless CMS with optional **Puck Visual Builder**.
  - **Atomic Payload** (`atomicpayload.com`): official isolated website-builder template — Payload + Next.js + Tailwind with every `@pro-laico/*` plugin (MongoDB + Vercel Blob, pnpm, admin at `localhost:42100/admin`); scaffolded via `npx @pro-laico/create-atomic-payload`; not affiliated with Payload CMS.
  - **Keystone CMS / Strapi**: Self-hosted headless alternatives.
- **E-Commerce Backend**:
  - **Payload E-Commerce Module**: Native unified database-level checkout and cart management.
  - **Medusa v2 (`@latest`)**: Sovereign headless commerce engine for complex inventory and multi-region storefronts.
- **Database & ORM**: **Neon** (Serverless PostgreSQL) or **Supabase** via **Drizzle ORM**.
- **Authentication**: **Better Auth** (Self-hosted in Postgres) or **Supabase Auth**.
- **Mobile Conversion**: **Expo** (for React Native native mobile apps) or **Ionic Capacitor** (for wrapping Next.js/React export into native iOS/Android APK).
- **Hosting & Infrastructure**: Cloudflare Pages / Docker / Coolify / Vercel.

---

## 🌐 Direction 4: Modern WordPress & Enterprise CMS

> **Best For**: Content-heavy editorial publishing, bespoke enterprise agency setups, and headless WordPress architectures.

### Core Toolchain & Stack
- **Architecture**: **Roots Bedrock** (12-factor configuration, Composer dependency management).
- **CMS**: WordPress 6.x+ with Modern Gutenberg Blocks (`@wordpress/scripts`).
- **API & Headless**: WP REST API / WPGraphQL for decoupled Next.js / Astro frontends.
- **Code Quality**: PSR-12 / WordPress Coding Standards (WPCS) with `phpcs`.
- **Testing**: PHPUnit / `wp-env` integration suite.
- **Hosting**: Fast PHP 8.2+ managed hosting, Kinsta, WP Engine, or custom Cloudflare-proxied VPS.

---

## 📱 Direction 5: Cross-Platform Mobile Applications & Native Packaging

> **Best For**: Native iOS and Android applications with web code-sharing or native packaging.

### Core Paradigms & Toolchains
1. **Paradigm A: React Native with Expo (`@latest`) [Pure Native App]**
   - **Framework**: React Native with managed Expo Router v4 (file-based navigation).
   - **Styling**: NativeWind (Tailwind CSS for React Native) or StyleSheet tokens.
   - **Backend & Auth**: Supabase / Better Auth API.
   - **Tooling**: Bun runtime, EAS Build.
2. **Paradigm B: Astro + Ionic Capacitor (`@latest`) [Web-to-APK/iOS]**
   - **Framework**: Astro v7 static web platform wrapped via `@capacitor/cli` and `@capacitor/core`.
   - **State**: **Nano Stores** for lightweight cross-component reactivity.
   - **Output**: Native Xcode (.xcodeproj) and Android Studio (.apk / .aab) builds.
3. **Paradigm C: Next.js / React + Ionic Capacitor [Web-to-APK/iOS]**
   - **Framework**: Next.js static export (`output: 'export'`) wrapped with Capacitor bridge for native push notifications, biometrics, and camera access.

---

## 🔒 Tech Stack Invariants
1. **Always-Latest Package Resolution**: Whenever scaffolding or adding dependencies, always resolve to `@latest`. Never pin deprecated or arbitrary commit hashes (`#<sha>`).
2. **Open-Source & Self-Hosted Priority**: Always prefer open-source and self-hostable solutions (Payload, Medusa, Better Auth, Drizzle, Roots) before third-party cloud services.
3. **Universal Custom & None**: Every architectural layer must provide a `Custom` option for user-defined tooling and a `None` option for pure zero-dependency baselines.
4. **Zero Secret Exposure**: Strict adherence to the Vibeguard secret defense protocol. Never commit `.env` or plaintext credentials.
5. **Accessibility Baseline**: WCAG 2.2 AA compliance is mandatory across all user-facing components.


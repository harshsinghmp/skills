# Native Mobile Animation

> **Load only when the user explicitly asks for native/mobile animation** — React Native (Reanimated), SwiftUI, Jetpack Compose, or Flutter. Web motion defaults (Motion/CSS) don't apply here.

## When to load

Explicit request for mobile/native animation, one of the four platforms below named.

## 1. React Native — Reanimated

Reanimated runs animations on the UI thread (no JS bridge stall), unlike the legacy `Animated` API. Default choice for RN.

```jsx
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withSequence, withDelay,
} from "react-native-reanimated";

const offset = useSharedValue(0);
const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

// trigger
offset.value = withSpring(100, { damping: 15, stiffness: 120 });
offset.value = withTiming(100, { duration: 200, easing: Easing.out(Easing.cubic) });
```

- **`useSharedValue`** holds a mutable value read/written on the UI thread (`.value`).
- **`useAnimatedStyle`** returns a style that re-renders without a React commit.
- **`withSpring`** / `withTiming` / `withRepeat` / `withSequence` / `withDelay` compose movement.
- **Layout Animations**: `entering={FadeIn} exiting={FadeOut}` (or `SlideInRight`, `ZoomIn`, `Stagger`) for mount/unmount.
- **`useAnimatedScrollHandler`** + `scrollY.value` for scroll-linked motion.
- Web analog: `useSharedValue` ≈ Motion `useMotionValue` / `useSpring`; `entering/`exiting` ≈ `AnimatePresence`.

Why Reanimated over `Animated`: off-main-thread 60fps, declarative shared values, layout animations, gesture integration. Use `Animated` only for trivial one-off tweens.

```jsx
<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut} style={style} />
```

## 2. SwiftUI

```swift
withAnimation(.spring(duration: 0.5, bounce: 0.2)) { isOpen.toggle() }
// bind:
.animation(.spring(duration: 0.5, bounce: 0.2), value: isOpen)

// transitions + matched geometry
Text("Card")
  .transition(.scale.combined(with: .opacity))
.matchedGeometryEffect(id: "card", in: namespace)

// explicit
.animation(.easeOut(duration: 0.25), value: offset)
```

- `withAnimation` wraps state mutation; `.animation(_:value:)` animates on value change.
- `.transition(.scale/.slide/.move/.opacity/.asymmetric)` + `withAnimation` for mount/unmount.
- `matchedGeometryEffect(id:in:)` = shared-element transition (web analog: Motion `layoutId`).
- `spring` favors `duration`+`bounce` or `stiffness`+`damping`.

## 3. Jetpack Compose

```kotlin
val animated by animateFloatAsState(
  targetValue = if (expanded) 1f else 0f,
  animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
)
// built-ins: animateColorAsState, animateDpAsState, animateIntAsState

AnimatedVisibility(visible = expanded, enter = fadeIn(), exit = shrinkVertically()) { ... }

Modifier.animateContentSize()
```

- `animate*AsState` animates a single value on target change (web analog: CSS transition).
- `Animatable` / `updateTransition` for multi-property choreographed transitions.
- `AnimatedVisibility` = enter/exit animation (web: `AnimatePresence`).

## 4. Flutter

```dart
// Implicit — animate when a value changes (web: CSS transition)
AnimatedContainer(duration: Duration(milliseconds: 250), curve: Curves.easeOutCubic, width: w, height: h);

AnimatedOpacity(duration: ..., opacity: _visible ? 1.0 : 0.0);

// Explicit — single controller timeline (web: keyframes)
final ctrl = AnimationController(vsync: this, duration: Duration(milliseconds: 300));
AnimatedBuilder(animation: ctrl, builder: (ctx, child) => Transform.translate(...));

TweenAnimationBuilder(tween: Tween(begin: 0, end: 1), duration: ..., builder: ...)

// Shared-element transitions
Hero(tag: "card", child: ...);
```

- **Implicit** (`AnimatedContainer`, `AnimatedOpacity`, …): animate on value change, no controller.
- **Explicit** (`AnimationController` + `Tween` + `AnimatedBuilder`): full timeline control.
- **`Hero`** = shared-element transition between routes (web: `layoutId`).

## Gotchas

- Reanimated: never mutate `.value` during React render — only in worklets/gesture/effect callbacks.
- Reanimated worklets must be pure JS (no closures over React state) — they run on the UI thread.
- SwiftUI `matchedGeometryEffect` needs a shared `@Namespace`; `id` must match across both views.
- Compose `animate*AsState` restarts from current value on target change (interruptible like CSS transitions).
- Flutter implicit widgets need a `curve` or motion reads mechanical; explicit ones need `vsync`.
- Respect platform reduced-motion (`UIAccessibility.isReduceMotionEnabled`, `AccessibilityManager.isEnabled`, `MediaQuery.disableAnimations`).
#!/usr/bin/env bun
/**
 * sample-size.ts — quantitative sample-size / saturation helpers.
 *
 * Two tools:
 *   eq               required sample size n for a proportion (finite-population corrected)
 *   net_minus_n      participant-count gate for "is this a theme-able recurrence" (qualitative)
 *
 * Pure math, no IO risks beyond reading argv. Usage:
 *   bun research/scripts/sample-size.ts eq   <p> <delta_p> <z> [N]
 *   bun research/scripts/sample-size.ts gist <K>
 *
 * Defaults: p=0.5, delta_p=0.05, z=1.96 (95%), N=0 (unknown population → no FPC).
 */
const [mode, a, b, c, d] = process.argv.slice(2);

function z2w(z: number): number {
  // two-sided weight for the confidence level z (z ~ 1.96 → 1.96²)
  return z * z;
}

function sampleSize(p: number, delta: number, z: number, N: number): number {
  // ponytail: uncorrected sample for a proportion; adds finite-population correction only when N given.
  const w = z2w(z);
  const nInf = (w * p * (1 - p)) / (delta * delta);
  if (!N || N <= 0) return Math.ceil(nInf);
  // FPC: n = nInf * N / (nInf + N - 1)
  return Math.ceil((nInf * N) / (nInf + N - 1));
}

function themeGate(K: number): number {
  // qualitative saturation gate — a theme is worth paying attention to once it recurs in K participants.
  // Minimal floor: a single participant (K=1) is an anecdote, not a finding; insist the caller proves 2+.
  return Math.max(2, K);
}

if (mode === "eq") {
  const p = parseFloat(a ?? "0.5");
  const delta = parseFloat(b ?? "0.05");
  const z = parseFloat(c ?? "1.96");
  const N = parseInt(d ?? "0", 10);
  if (!(p > 0 && p < 1) || !(delta > 0)) {
    console.error("usage: sample-size.ts eq <p in (0,1)> <delta_p> <z> [N]");
    process.exit(2);
  }
  console.log(sampleSize(p, delta, z, N));
} else if (mode === "gist") {
  const K = parseInt(a ?? "2", 10);
  console.log(themeGate(K));
} else {
  console.error("usage: sample-size.ts eq <p> <delta_p> <z> [N]  |  gist <K>");
  process.exit(2);
}

// self-check — fails loudly if the math breaks.
function selfCheck(): void {
  // 95% CI, p=0.5, ±5% → classic ~385.
  const s = sampleSize(0.5, 0.05, 1.96, 0);
  if (s < 380 || s > 385) throw new Error(`sampleSize eq sanity failed: ${s}`);
  if (sampleSize(0.5, 0.05, 1.96, 1000) >= s)
    throw new Error("FPC must shrink the sample for a small finite population");
  if (themeGate(1) !== 2) throw new Error("themeGate floor failed");
}
if (process.env.SELF_CHECK) selfCheck();

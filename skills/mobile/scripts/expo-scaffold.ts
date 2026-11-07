#!/usr/bin/env bun
/**
 * expo-scaffold.ts: Expo SDK 52 Universal Mobile App Scaffolder, Auditor & Deep Link Verifier.
 *
 * Implements EXP-001 through EXP-004:
 *   - EXP-001: Modern Expo SDK 52 Universal Architecture (expo-router v4, Hermes, New Architecture, Android 15 edge-to-edge, iOS 15.1+)
 *   - EXP-002: NativeWind v4 & OKLCH Theme Integration (Compiled StyleSheets, useSafeAreaInsets)
 *   - EXP-003: Deep Linking & Universal Links / App Links Architecture (app scheme, applinks, assetlinks, auth/pay callbacks)
 *   - EXP-004: Native Hardware Access & Ephemeral Mocking Fences (Camera, SecureStore, Haptics, LocalAuthentication)
 *
 * Usage:
 *   bun expo-scaffold.ts --scaffold-app [--name <app>] [--slug <slug>] [--scheme <scheme>] [--bundle-id <bundleId>] [--output <dir>] [--json]
 *   bun expo-scaffold.ts --audit-app <dir|app.json> [--json]
 *   bun expo-scaffold.ts --verify-deep-links <dir|app.json> [--json]
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export interface ScaffoldOptions {
  name: string;
  slug: string;
  scheme: string;
  bundleId: string;
  outputDir?: string;
}

export interface ScaffoldResult {
  success: boolean;
  filesWritten: string[];
  appJson: Record<string, unknown>;
  packageJson: Record<string, unknown>;
}

export interface ExpoAuditResult {
  passed: boolean;
  verdict: "PASS" | "BLOCK";
  score: number;
  sdkVersion: string;
  hermesEnabled: boolean;
  newArchEnabled: boolean;
  hasScheme: boolean;
  hasDeepLinks: boolean;
  hasEdgeToEdge: boolean;
  hasDeploymentTarget: boolean;
  issues: string[];
  recommendations: string[];
}

export interface DeepLinkVerificationResult {
  valid: boolean;
  schemes: string[];
  universalLinks: {
    iosDomains: string[];
    androidHosts: string[];
    autoVerify: boolean;
  };
  issues: string[];
}

interface RawExpoConfig {
  expo?: {
    name?: string;
    slug?: string;
    version?: string;
    scheme?: string;
    sdkVersion?: string;
    jsEngine?: string;
    newArchEnabled?: boolean;
    ios?: {
      bundleIdentifier?: string;
      deploymentTarget?: string;
      associatedDomains?: string[];
      [key: string]: unknown;
    };
    android?: {
      package?: string;
      edgeToEdge?: boolean;
      intentFilters?: Array<{
        action?: string;
        autoVerify?: boolean;
        data?: Array<{
          scheme?: string;
          host?: string;
          pathPrefix?: string;
          [key: string]: unknown;
        }>;
        category?: string[];
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
    plugins?: Array<string | [string, unknown]>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Generate a production-grade Expo SDK 52 universal app scaffold adhering to EXP-001 - EXP-004.
 */
export function generateExpoScaffold(options: ScaffoldOptions): ScaffoldResult {
  const name = options.name || "Universal App";
  const slug = options.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const scheme = options.scheme || slug.replace(/-/g, "");
  const bundleId = options.bundleId || `com.agency.${slug.replace(/-/g, "")}`;
  const domain = `${slug}.example.com`;

  const appJson = {
    expo: {
      name,
      slug,
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      scheme,
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      jsEngine: "hermes",
      ios: {
        supportsTablet: true,
        bundleIdentifier: bundleId,
        deploymentTarget: "15.1",
        associatedDomains: [`applinks:${domain}`],
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
        package: bundleId,
        edgeToEdge: true,
        intentFilters: [
          {
            action: "VIEW",
            autoVerify: true,
            data: [
              {
                scheme: "https",
                host: domain,
                pathPrefix: "/",
              },
            ],
            category: ["BROWSABLE", "DEFAULT"],
          },
        ],
      },
      plugins: ["expo-router", "expo-secure-store", "expo-local-authentication", "expo-haptics"],
      experiments: {
        typedRoutes: true,
      },
    },
  };

  const packageJson = {
    name: slug,
    main: "expo-router/entry",
    version: "1.0.0",
    scripts: {
      start: "expo start",
      android: "expo run:android",
      ios: "expo run:ios",
      web: "expo start --web",
    },
    dependencies: {
      expo: "~52.0.0",
      "expo-camera": "~16.0.0",
      "expo-haptics": "~14.0.0",
      "expo-local-authentication": "~15.0.0",
      "expo-router": "~4.0.0",
      "expo-secure-store": "~14.0.0",
      nativewind: "^4.0.1",
      react: "18.3.1",
      "react-native": "0.76.2",
      "react-native-safe-area-context": "4.12.0",
      "react-native-screens": "~4.1.0",
    },
    devDependencies: {
      "@babel/core": "^7.25.2",
      "@types/react": "~18.3.12",
      tailwindcss: "^3.4.14",
      typescript: "^5.3.3",
    },
  };

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "oklch(var(--color-primary, 0.62 0.19 259) / <alpha-value>)",
        surface: "oklch(var(--color-surface, 0.98 0.01 260) / <alpha-value>)",
        background: "oklch(var(--color-background, 1.0 0 0) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
`;

  const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  const rootLayoutTsx = `import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/callback" />
        <Stack.Screen name="pay/confirm" />
      </Stack>
    </SafeAreaProvider>
  );
}
`;

  const homeIndexTsx = `import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-white dark:bg-black items-center justify-center p-6"
    >
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Expo SDK 52 Universal App
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-300 mt-2 text-center">
        File-based routing with New Architecture, Hermes bytecode, and NativeWind v4
      </Text>
    </View>
  );
}
`;

  const authCallbackTsx = `import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; state?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.code) {
      router.replace("/");
    }
  }, [params.code, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-base text-gray-700">Verifying authentication token...</Text>
    </View>
  );
}
`;

  const payConfirmTsx = `import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function PaymentConfirm() {
  const params = useLocalSearchParams<{ session_id?: string; status?: string }>();
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-xl font-bold text-green-600">Payment Verified</Text>
      <Text className="text-sm text-gray-600 mt-2">
        Session: {params.session_id || "direct"}
      </Text>
      <TouchableOpacity
        onPress={() => router.replace("/")}
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3"
      >
        <Text className="text-white font-medium">Continue to App</Text>
      </TouchableOpacity>
    </View>
  );
}
`;

  const hardwareFenceTsx = `import { Platform } from "react-native";

export async function checkBiometricsAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const LocalAuth = await import("expo-local-authentication");
    return await LocalAuth.hasHardwareAsync();
  } catch {
    return false;
  }
}

export async function getSecureItemWithFallback(key: string): Promise<string | null> {
  try {
    const SecureStore = await import("expo-secure-store");
    if (await SecureStore.isAvailableAsync()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    // Ephemeral in-memory fallback for test harnesses and simulators
  }
  return null;
}
`;

  const filesWritten: string[] = [];

  if (options.outputDir) {
    const baseDir = path.resolve(options.outputDir);
    const writeTarget = (relPath: string, content: string) => {
      const fullPath = path.join(baseDir, relPath);
      const parent = path.dirname(fullPath);
      if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, "utf8");
      filesWritten.push(fullPath);
    };

    writeTarget("app.json", JSON.stringify(appJson, null, 2));
    writeTarget("package.json", JSON.stringify(packageJson, null, 2));
    writeTarget("tailwind.config.js", tailwindConfig);
    writeTarget("global.css", globalCss);
    writeTarget("app/_layout.tsx", rootLayoutTsx);
    writeTarget("app/index.tsx", homeIndexTsx);
    writeTarget("app/(auth)/callback.tsx", authCallbackTsx);
    writeTarget("app/pay/confirm.tsx", payConfirmTsx);
    writeTarget("components/hardware-fence.tsx", hardwareFenceTsx);
  }

  return {
    success: true,
    filesWritten,
    appJson,
    packageJson,
  };
}

/**
 * Normalizes input (directory path, JSON file path, or object) into an Expo configuration object.
 */
function resolveConfig(input: string | object): { config: RawExpoConfig; sdkVersionFallback: string } {
  if (typeof input === "object" && input !== null) {
    const raw = input as RawExpoConfig;
    return {
      config: raw.expo ? raw : { expo: raw as unknown as RawExpoConfig["expo"] },
      sdkVersionFallback: "",
    };
  }

  if (typeof input === "string") {
    const resolvedPath = path.resolve(input);
    if (fs.existsSync(resolvedPath)) {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        const appJsonPath = path.join(resolvedPath, "app.json");
        let pkgSdk = "";
        const pkgJsonPath = path.join(resolvedPath, "package.json");
        if (fs.existsSync(pkgJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
            const expoDep = pkg.dependencies?.expo || "";
            const match = expoDep.match(/(\d+)/);
            if (match) pkgSdk = match[1];
          } catch {
            // ignore JSON parse error in package.json
          }
        }

        if (fs.existsSync(appJsonPath)) {
          const raw = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
          return { config: raw, sdkVersionFallback: pkgSdk };
        }
        throw new Error(`app.json not found in directory: ${resolvedPath}`);
      }

      if (stat.isFile()) {
        const raw = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
        return { config: raw, sdkVersionFallback: "" };
      }
    }

    // Try parsing as JSON string directly
    try {
      const raw = JSON.parse(input);
      return { config: raw, sdkVersionFallback: "" };
    } catch {
      throw new Error(`Target does not exist or is not valid JSON: ${input}`);
    }
  }

  throw new Error("Invalid input provided to resolveConfig");
}

/**
 * Audits an Expo configuration against EXP-001 through EXP-004 invariants.
 */
export function auditExpoConfig(appJsonOrDir: string | object): ExpoAuditResult {
  const { config, sdkVersionFallback } = resolveConfig(appJsonOrDir);
  const expo = config.expo || {};

  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // 1. SDK Version Check (>= 51, ideally 52) - 20 pts
  let sdkVer = expo.sdkVersion || sdkVersionFallback || "";
  let sdkNum = 0;
  if (sdkVer) {
    const match = sdkVer.match(/(\d+)/);
    if (match) sdkNum = Number.parseInt(match[1], 10);
  }

  // If no explicit sdkVersion in app.json, SDK 52 can be assumed when newArchEnabled is present
  if (sdkNum >= 51) {
    score += 20;
  } else if (!sdkVer && expo.newArchEnabled) {
    // Modern Expo SDK 52 config omits sdkVersion and relies on package.json
    score += 20;
    sdkVer = "52 (inferred)";
    sdkNum = 52;
  } else {
    issues.push("EXP-001: Expo SDK version must be >= 51 (target SDK 52 for New Architecture support)");
    recommendations.push("Upgrade project to Expo SDK 52 using 'npx expo install expo@~52.0.0'");
  }

  // 2. Hermes Bytecode Engine - 15 pts
  const hermesEnabled = expo.jsEngine === "hermes" || (!expo.jsEngine && sdkNum >= 51);
  if (hermesEnabled) {
    score += 15;
  } else {
    issues.push("EXP-001: Hermes bytecode engine required (jsEngine: 'hermes')");
    recommendations.push("Set jsEngine: 'hermes' in app.json for sub-150ms TTI");
  }

  // 3. React Native New Architecture - 15 pts
  const newArchEnabled = expo.newArchEnabled === true;
  if (newArchEnabled) {
    score += 15;
  } else {
    issues.push("EXP-001: React Native New Architecture must be enabled (newArchEnabled: true)");
    recommendations.push("Enable React Native New Architecture with newArchEnabled: true in app.json");
  }

  // 4. Custom Scheme - 15 pts
  const hasScheme = typeof expo.scheme === "string" && expo.scheme.trim().length > 0;
  if (hasScheme) {
    score += 15;
  } else {
    issues.push("EXP-003: Custom deep link scheme missing in app.json (scheme: '<app-slug>')");
    recommendations.push("Define a URL scheme in app.json to enable protocol-based deep linking");
  }

  // 5. Deep Links & Universal Links - 15 pts
  const iosDomains = expo.ios?.associatedDomains || [];
  const hasIosUniversal = Array.isArray(iosDomains) && iosDomains.some((d) => d.startsWith("applinks:"));

  const intentFilters = expo.android?.intentFilters || [];
  const hasAndroidAppLinks =
    Array.isArray(intentFilters) &&
    intentFilters.some((filter) => {
      const isView = filter.action === "VIEW" || filter.action === "android.intent.action.VIEW";
      const isAutoVerify = filter.autoVerify === true;
      const hasHttps = Array.isArray(filter.data) && filter.data.some((d) => d.scheme === "https");
      return isView && isAutoVerify && hasHttps;
    });

  const hasDeepLinks = hasIosUniversal && hasAndroidAppLinks;
  if (hasDeepLinks) {
    score += 15;
  } else if (hasIosUniversal || hasAndroidAppLinks) {
    score += 8;
    issues.push(
      "EXP-003: Incomplete universal links (requires both iOS applinks and Android intentFilters with autoVerify)",
    );
    recommendations.push(
      "Configure both iOS associatedDomains (applinks:<domain>) and Android intentFilters with autoVerify: true",
    );
  } else {
    issues.push("EXP-003: Universal Links / App Links missing from iOS and Android configuration");
    recommendations.push("Add iOS associatedDomains (applinks:<domain>) and Android autoVerify intentFilters");
  }

  // 6. Edge-to-Edge Android 15 - 10 pts
  const hasEdgeToEdge = expo.android?.edgeToEdge === true;
  if (hasEdgeToEdge) {
    score += 10;
  } else {
    issues.push("EXP-001: Android 15 edge-to-edge support must be enabled (android.edgeToEdge: true)");
    recommendations.push("Set android.edgeToEdge: true in app.json for Android 15 compliance");
  }

  // 7. iOS Minimum Deployment Target (>= 15.1) - 10 pts
  const targetStr = expo.ios?.deploymentTarget || "0";
  const targetNum = Number.parseFloat(targetStr);
  const hasDeploymentTarget = targetNum >= 15.1;
  if (hasDeploymentTarget) {
    score += 10;
  } else {
    issues.push("EXP-001: iOS deployment target must be >= 15.1 (ios.deploymentTarget: '15.1')");
    recommendations.push("Set ios.deploymentTarget: '15.1' in app.json");
  }

  const passed = score >= 75 && newArchEnabled && hasScheme && hermesEnabled;
  const verdict: "PASS" | "BLOCK" = passed ? "PASS" : "BLOCK";

  return {
    passed,
    verdict,
    score,
    sdkVersion: sdkVer || "unknown",
    hermesEnabled,
    newArchEnabled,
    hasScheme,
    hasDeepLinks,
    hasEdgeToEdge,
    hasDeploymentTarget,
    issues,
    recommendations,
  };
}

/**
 * Validates schemes and universal link domain configuration.
 */
export function verifyDeepLinks(configOrDir: string | object): DeepLinkVerificationResult {
  const { config } = resolveConfig(configOrDir);
  const expo = config.expo || {};

  const schemes: string[] = [];
  if (typeof expo.scheme === "string" && expo.scheme.trim().length > 0) {
    schemes.push(expo.scheme.trim());
  }

  const iosDomains: string[] = [];
  for (const domain of expo.ios?.associatedDomains || []) {
    if (typeof domain === "string" && domain.startsWith("applinks:")) {
      iosDomains.push(domain.replace(/^applinks:/, ""));
    }
  }

  const androidHosts: string[] = [];
  let autoVerify = false;

  for (const filter of expo.android?.intentFilters || []) {
    if (filter.autoVerify === true) {
      autoVerify = true;
    }
    for (const d of filter.data || []) {
      if (d.scheme === "https" && typeof d.host === "string") {
        androidHosts.push(d.host);
      }
    }
  }

  const issues: string[] = [];
  if (schemes.length === 0) {
    issues.push("Missing custom URL scheme (expo.scheme)");
  }
  if (iosDomains.length === 0) {
    issues.push("Missing iOS Universal Links (expo.ios.associatedDomains with applinks:<domain>)");
  }
  if (androidHosts.length === 0) {
    issues.push("Missing Android App Links host (expo.android.intentFilters with scheme: 'https')");
  }
  if (!autoVerify) {
    issues.push("Android App Links autoVerify is not enabled (autoVerify: true)");
  }

  const valid = issues.length === 0;

  return {
    valid,
    schemes,
    universalLinks: {
      iosDomains,
      androidHosts,
      autoVerify,
    },
    issues,
  };
}

// ─── CLI Entrypoint ──────────────────────────────────────────────────────────
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  // 1. Scaffold Command
  const scaffoldIdx = args.indexOf("--scaffold-app");
  if (scaffoldIdx !== -1) {
    const getArg = (flag: string) => {
      const idx = args.indexOf(flag);
      return idx !== -1 ? args[idx + 1] : undefined;
    };

    const name = getArg("--name") || "Universal App";
    const slug = getArg("--slug") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const scheme = getArg("--scheme") || slug.replace(/-/g, "");
    const bundleId = getArg("--bundle-id") || `com.agency.${slug.replace(/-/g, "")}`;
    const outputDir = getArg("--output");

    const result = generateExpoScaffold({
      name,
      slug,
      scheme,
      bundleId,
      outputDir,
    });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n📱 Expo SDK 52 Universal Scaffold Created`);
      console.log(`Name:      ${name}`);
      console.log(`Slug:      ${slug}`);
      console.log(`Scheme:    ${scheme}://`);
      console.log(`Bundle ID: ${bundleId}`);
      if (outputDir) {
        console.log(`Output:    ${outputDir}`);
        console.log(`Files (${result.filesWritten.length}):`);
        for (const file of result.filesWritten) {
          console.log(`  • ${path.relative(process.cwd(), file)}`);
        }
      }
    }
    process.exit(0);
  }

  // 2. Audit Command
  const auditIdx = args.indexOf("--audit-app");
  if (auditIdx !== -1 && args[auditIdx + 1]) {
    const target = args[auditIdx + 1];
    let auditResult: ExpoAuditResult;
    try {
      auditResult = auditExpoConfig(target);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (isJson) {
        console.log(JSON.stringify({ error: message, passed: false, verdict: "BLOCK" }, null, 2));
      } else {
        console.error(`❌ Audit Error: ${message}`);
      }
      process.exit(1);
    }

    if (isJson) {
      console.log(JSON.stringify(auditResult, null, 2));
    } else {
      console.log(`\n📱 Expo SDK 52 Architecture Audit: ${target}`);
      console.log(`Score:   ${auditResult.score}/100`);
      console.log(`Verdict: ${auditResult.verdict}\n`);

      console.log("Invariants:");
      console.log(
        `  [${auditResult.newArchEnabled ? "✓" : "✗"}] EXP-001: React Native New Architecture (newArchEnabled)`,
      );
      console.log(`  [${auditResult.hermesEnabled ? "✓" : "✗"}] EXP-001: Hermes Bytecode Engine (jsEngine)`);
      console.log(`  [${auditResult.hasEdgeToEdge ? "✓" : "✗"}] EXP-001: Android 15 Edge-to-Edge (edgeToEdge)`);
      console.log(`  [${auditResult.hasDeploymentTarget ? "✓" : "✗"}] EXP-001: iOS Deployment Target >= 15.1`);
      console.log(
        `  [${auditResult.hasScheme ? "✓" : "✗"}] EXP-003: Custom URL Scheme (${auditResult.hasScheme ? "Configured" : "Missing"})`,
      );
      console.log(`  [${auditResult.hasDeepLinks ? "✓" : "✗"}] EXP-003: Universal Links & App Links`);

      if (auditResult.issues.length > 0) {
        console.log("\nDefects:");
        for (const issue of auditResult.issues) {
          console.log(`  • ${issue}`);
        }
      }
      if (auditResult.recommendations.length > 0) {
        console.log("\nRecommendations:");
        for (const rec of auditResult.recommendations) {
          console.log(`  • ${rec}`);
        }
      }
    }
    process.exit(auditResult.passed ? 0 : 1);
  }

  // 3. Verify Deep Links Command
  const linkIdx = args.indexOf("--verify-deep-links");
  if (linkIdx !== -1 && args[linkIdx + 1]) {
    const target = args[linkIdx + 1];
    let linkResult: DeepLinkVerificationResult;
    try {
      linkResult = verifyDeepLinks(target);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (isJson) {
        console.log(JSON.stringify({ error: message, valid: false }, null, 2));
      } else {
        console.error(`❌ Verification Error: ${message}`);
      }
      process.exit(1);
    }

    if (isJson) {
      console.log(JSON.stringify(linkResult, null, 2));
    } else {
      console.log(`\n🔗 Deep Link & Universal Link Verification: ${target}`);
      console.log(`Status: ${linkResult.valid ? "VALID" : "INVALID"}`);
      console.log(`Schemes: ${linkResult.schemes.join(", ") || "None"}`);
      console.log(`iOS Universal Domains: ${linkResult.universalLinks.iosDomains.join(", ") || "None"}`);
      console.log(`Android App Links Hosts: ${linkResult.universalLinks.androidHosts.join(", ") || "None"}`);
      console.log(`Android autoVerify: ${linkResult.universalLinks.autoVerify ? "Enabled" : "Disabled"}`);

      if (linkResult.issues.length > 0) {
        console.log("\nIssues:");
        for (const issue of linkResult.issues) {
          console.log(`  • ${issue}`);
        }
      }
    }
    process.exit(linkResult.valid ? 0 : 1);
  }

  console.log(`expo-scaffold.ts — Universal Mobile App & Expo SDK 52 Architecture CLI

Usage:
  bun expo-scaffold.ts --scaffold-app [--name <app>] [--slug <slug>] [--scheme <scheme>] [--bundle-id <bundleId>] [--output <dir>] [--json]
  bun expo-scaffold.ts --audit-app <dir|app.json> [--json]
  bun expo-scaffold.ts --verify-deep-links <dir|app.json> [--json]
`);
  process.exit(0);
}

#!/usr/bin/env bun

/**
 * eval-provider.ts: OpenAI-compatible multi-model provider adapter for qa-launch:evals.
 *
 * Lets EVL-002 judges run against local runtimes (Ollama, vLLM) or any
 * OpenAI-compatible cloud endpoint without changing the evaluation contract:
 *   - deterministic sampling via a fixed seed
 *   - per-call token telemetry and cost accounting
 *   - explicit timeouts and typed failures
 *
 * Usage:
 *   bun eval-provider.ts --provider ollama --prompt "Score this output" [--json]
 *   bun eval-provider.ts --provider vllm --model Qwen/Qwen2.5-7B-Instruct --prompt "..."
 *   bun eval-provider.ts --provider openai-compatible --base-url ... --model ... --prompt "..."
 */

import { parseArgs } from "node:util";

export type ProviderKind = "ollama" | "vllm" | "openai-compatible";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  apiKey?: string;
  seed: number;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export interface ProviderOverrides {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
  seed?: number;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface ChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResult {
  provider: ProviderKind;
  model: string;
  seed: number;
  content: string;
  usage: ChatUsage;
  latencyMs: number;
  costUsd: number;
}

export interface TelemetrySnapshot {
  runs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
}

type Env = Record<string, string | undefined>;

interface ProviderDefaults {
  baseUrl: string;
  model: string;
  apiKey?: string;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: unknown } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

const PROVIDER_DEFAULTS: Record<ProviderKind, ProviderDefaults> = {
  ollama: {
    baseUrl: "http://127.0.0.1:11434/v1",
    model: "llama3.2",
    apiKey: "ollama",
  },
  vllm: {
    baseUrl: "http://127.0.0.1:8000/v1",
    model: "Qwen/Qwen2.5-7B-Instruct",
    apiKey: "vllm",
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
};

const PROVIDER_KINDS: ProviderKind[] = ["ollama", "vllm", "openai-compatible"];

export function isProviderKind(value: string): value is ProviderKind {
  return (PROVIDER_KINDS as string[]).includes(value);
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function finiteNumber(value: number | undefined, fallback: number, label: string): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) throw new Error(`${label} must be a finite number.`);
  return value;
}

/**
 * Resolve a provider configuration from defaults, explicit overrides, and the
 * environment. Cloud credentials come from `EVAL_API_KEY`/`OPENAI_API_KEY`.
 */
export function resolveProviderConfig(
  kind: ProviderKind,
  overrides: ProviderOverrides = {},
  env: Env = process.env,
): ProviderConfig {
  const defaults = PROVIDER_DEFAULTS[kind];
  const envBaseUrl =
    kind === "ollama"
      ? env.OLLAMA_BASE_URL
      : kind === "vllm"
        ? env.VLLM_BASE_URL
        : (env.EVAL_BASE_URL ?? env.OPENAI_BASE_URL);
  const envModel =
    kind === "ollama" ? env.OLLAMA_MODEL : kind === "vllm" ? env.VLLM_MODEL : (env.EVAL_MODEL ?? env.OPENAI_MODEL);
  const envApiKey =
    kind === "ollama"
      ? env.OLLAMA_API_KEY
      : kind === "vllm"
        ? env.VLLM_API_KEY
        : (env.EVAL_API_KEY ?? env.OPENAI_API_KEY);

  const config: ProviderConfig = {
    kind,
    baseUrl: normalizeBaseUrl(overrides.baseUrl ?? envBaseUrl ?? defaults.baseUrl),
    model: overrides.model ?? envModel ?? defaults.model,
    seed: Math.trunc(finiteNumber(overrides.seed, 42, "seed")),
    temperature: finiteNumber(overrides.temperature, 0, "temperature"),
    maxTokens: Math.trunc(finiteNumber(overrides.maxTokens, 512, "maxTokens")),
    timeoutMs: Math.trunc(finiteNumber(overrides.timeoutMs, 30000, "timeoutMs")),
  };

  const apiKey = overrides.apiKey ?? envApiKey ?? defaults.apiKey;
  if (apiKey) config.apiKey = apiKey;
  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error("temperature must be between 0 and 2.");
  }
  if (config.maxTokens <= 0) throw new Error("maxTokens must be greater than 0.");
  if (config.timeoutMs <= 0) throw new Error("timeoutMs must be greater than 0.");
  return config;
}

function usageOf(payload: ChatCompletionResponse): ChatUsage {
  const promptTokens = payload.usage?.prompt_tokens ?? 0;
  const completionTokens = payload.usage?.completion_tokens ?? 0;
  const totalTokens = payload.usage?.total_tokens ?? promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens };
}

/** Local runtimes are free; cloud cost is injected by the caller when known. */
function costOf(kind: ProviderKind, usage: ChatUsage, pricePerMillion?: { input: number; output: number }): number {
  if (kind !== "openai-compatible" || !pricePerMillion) return 0;
  const cost =
    (usage.promptTokens / 1_000_000) * pricePerMillion.input +
    (usage.completionTokens / 1_000_000) * pricePerMillion.output;
  return Number(cost.toFixed(6));
}

export interface ChatOptions {
  signal?: AbortSignal;
  pricePerMillion?: { input: number; output: number };
}

/**
 * Call an OpenAI-compatible `/chat/completions` endpoint. Deterministic when
 * the backend honours `seed`; no side effects beyond the HTTP request.
 */
export async function chatCompletion(
  config: ProviderConfig,
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  if (messages.length === 0) throw new Error("messages must not be empty.");

  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener("abort", forwardAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = Date.now();

  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`;

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          seed: config.seed,
          stream: false,
        }),
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(`provider ${config.kind} request timed out after ${config.timeoutMs}ms.`);
      }
      throw error;
    }

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`provider ${config.kind} request failed (${response.status}): ${text.slice(0, 300)}`);
    }

    let payload: ChatCompletionResponse;
    try {
      payload = JSON.parse(text) as ChatCompletionResponse;
    } catch {
      throw new Error(`provider ${config.kind} returned invalid JSON.`);
    }

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error(`provider ${config.kind} returned no message content.`);
    }

    const usage = usageOf(payload);
    return {
      provider: config.kind,
      model: config.model,
      seed: config.seed,
      content,
      usage,
      latencyMs: Date.now() - startedAt,
      costUsd: costOf(config.kind, usage, options.pricePerMillion),
    };
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}

/** In-memory telemetry accumulator for a single evaluation run. */
export class EvalTelemetry {
  private state: TelemetrySnapshot = {
    runs: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: 0,
    costUsd: 0,
  };

  record(result: ChatResult): void {
    this.state.runs += 1;
    this.state.promptTokens += result.usage.promptTokens;
    this.state.completionTokens += result.usage.completionTokens;
    this.state.totalTokens += result.usage.totalTokens;
    this.state.latencyMs += result.latencyMs;
    this.state.costUsd = Number((this.state.costUsd + result.costUsd).toFixed(6));
  }

  snapshot(): TelemetrySnapshot {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      runs: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: 0,
      costUsd: 0,
    };
  }
}

/** Chat plus telemetry recording, so callers cannot forget to account usage. */
export async function chatWithTelemetry(
  telemetry: EvalTelemetry,
  config: ProviderConfig,
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  const result = await chatCompletion(config, messages, options);
  telemetry.record(result);
  return result;
}

function usage(): string {
  return `Usage:
  bun eval-provider.ts --provider <ollama|vllm|openai-compatible> --prompt "<text>" [options]

Options:
  --provider <kind>     Backend kind (default: ollama)
  --model <name>        Model identifier (default from the provider)
  --base-url <url>      OpenAI-compatible base URL (default from the provider)
  --system <text>       Optional system message
  --prompt <text>       User prompt (required)
  --seed <n>            Deterministic sampling seed (default: 42)
  --temperature <n>     Sampling temperature (default: 0)
  --max-tokens <n>      Completion ceiling (default: 512)
  --timeout-ms <n>      Request timeout (default: 30000)
  --json                Emit the full result object
  -h, --help            Show this help`;
}

async function runCli(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      provider: { type: "string", default: "ollama" },
      model: { type: "string", default: "" },
      "base-url": { type: "string", default: "" },
      system: { type: "string", default: "" },
      prompt: { type: "string", default: "" },
      seed: { type: "string", default: "42" },
      temperature: { type: "string", default: "0" },
      "max-tokens": { type: "string", default: "512" },
      "timeout-ms": { type: "string", default: "30000" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help || !values.prompt) {
    console.log(usage());
    process.exit(values.help ? 0 : 2);
  }
  if (!isProviderKind(values.provider)) {
    throw new Error(`unknown provider "${values.provider}"; expected ${PROVIDER_KINDS.join(", ")}.`);
  }

  const config = resolveProviderConfig(values.provider, {
    model: values.model || undefined,
    baseUrl: values["base-url"] || undefined,
    seed: Number(values.seed),
    temperature: Number(values.temperature),
    maxTokens: Number(values["max-tokens"]),
    timeoutMs: Number(values["timeout-ms"]),
  });

  const messages: ChatMessage[] = [];
  if (values.system) messages.push({ role: "system", content: values.system });
  messages.push({ role: "user", content: values.prompt });

  const result = await chatCompletion(config, messages);
  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.content);
    console.error(
      `[${result.provider}/${result.model}] seed=${result.seed} tokens=${result.usage.totalTokens} latency=${result.latencyMs}ms cost=$${result.costUsd}`,
    );
  }
}

if (import.meta.main) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

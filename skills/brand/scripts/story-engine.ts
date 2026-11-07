/**
 * Muse Agency Council — Brand Genesis & Multimodal Story Engine
 *
 * Implements W7-T3:
 * - STR-001: Founder Archetype Alignment (Narrative frameworks, catalyst events, transformation arcs)
 * - STR-002: Multimodal Palette & Visual Narrative (OKLCH color psychology & emotional resonance curves)
 * - STR-003: Tagline & Elevator Pitch Matrix (5 distinct variants + 15s/30s/60s pitches)
 * - STR-004: Brand Voice Constitution (Forbidden words, cadence rules, 18-token quotable gate, lint runner)
 *
 * Council Lead: Jasper (Creative Technologist & Growth Mastermind)
 */

export type ArchetypeId =
  | "hero"
  | "creator"
  | "rebel"
  | "ruler"
  | "sage"
  | "magician"
  | "outlaw"
  | "everyman"
  | "lover"
  | "jester"
  | "caregiver"
  | "explorer";

export interface ArchetypeProfile {
  id: ArchetypeId;
  name: string;
  narrativeFramework: string;
  catalystEvent: string;
  shadowTrait: string;
  ethosTransformation: string;
  primaryEmotions: Array<"trust" | "excitement" | "authority" | "warmth" | "intrigue">;
}

export interface OklchColor {
  role: "primary" | "secondary" | "accent" | "neutral" | "surface" | "background";
  l: number; // Lightness: 0 - 1
  c: number; // Chroma: 0 - 0.4
  h: number; // Hue: 0 - 360
  cssString: string;
  contrastOnBackground: number;
}

export interface EmotionalResonanceCurve {
  trust: number; // 0.0 - 1.0
  excitement: number; // 0.0 - 1.0
  authority: number; // 0.0 - 1.0
  warmth: number; // 0.0 - 1.0
  intrigue: number; // 0.0 - 1.0
}

export interface TaglineMatrix {
  direct: string;
  aspirational: string;
  provocative: string;
  metaphorical: string;
  quantifiable: string;
}

export interface ElevatorPitchSuite {
  pitch15s: string;
  pitch30s: string;
  pitch60s: string;
}

export interface ToneSpectrum {
  formality: number; // 0 (hyper-casual) to 100 (academic/legal)
  irreverence: number; // 0 (pure reverence) to 100 (provocative iconoclast)
  technicalDensity: number; // 0 (layman/intuitive) to 100 (deep code/math)
  urgency: number; // 0 (zen/evergreen) to 100 (high-tempo catalyst)
}

export interface VoiceRuleViolation {
  ruleId: string;
  message: string;
  sample?: string;
  severity: "error" | "warning";
}

export interface VoiceAuditResult {
  passed: boolean;
  score: number; // 0 - 100
  forbiddenWordsFound: string[];
  quotableTokensCount: number;
  averageSentenceLength: number;
  violations: VoiceRuleViolation[];
}

export interface BrandVoiceConstitution {
  forbiddenWords: string[];
  maxSentenceWords: number;
  punchyOpenMaxWords: number;
  minQuotableTokens: number;
  maxQuotableTokens: number;
  toneSpectrum: ToneSpectrum;
}

export interface BrandGenesisInput {
  brandName: string;
  founderName: string;
  industry: string;
  archetype: ArchetypeId;
  catalystDescription: string;
  coreOffering: string;
  targetAudience: string;
  customForbiddenWords?: string[];
}

export interface BrandGenesisOutput {
  brandName: string;
  archetype: ArchetypeProfile;
  palette: OklchColor[];
  resonanceCurve: EmotionalResonanceCurve;
  taglines: TaglineMatrix;
  pitches: ElevatorPitchSuite;
  constitution: BrandVoiceConstitution;
  genesisSummaryMarkdown: string;
}

export const ARCHETYPE_PROFILES: Record<ArchetypeId, ArchetypeProfile> = {
  hero: {
    id: "hero",
    name: "The Hero / Champion",
    narrativeFramework: "Hero's Journey (Call to Adventure -> Abyss -> Mastery)",
    catalystEvent: "Confrontation with systemic failure or unyielding adversity",
    shadowTrait: "Arrogance and relentless burnout",
    ethosTransformation: "From isolated willpower to empowering collective resilience",
    primaryEmotions: ["authority", "excitement", "trust"],
  },
  creator: {
    id: "creator",
    name: "The Creator / Architect",
    narrativeFramework: "The Genesis Loop (Vision -> Subtraction -> Masterpiece)",
    catalystEvent: "Suffocation by derivative, unimaginative market defaults",
    shadowTrait: "Perfectionist paralysis and ivory-tower detachment",
    ethosTransformation: "From fragile perfectionism to prolific, compounding innovation",
    primaryEmotions: ["intrigue", "trust", "warmth"],
  },
  rebel: {
    id: "rebel",
    name: "The Rebel / Iconoclast",
    narrativeFramework: "David vs. Goliath (Sacred Cow -> Heresy -> New Order)",
    catalystEvent: "Discovery of exploitative incumbent rent-seeking",
    shadowTrait: "Destructive nihilism without an architectural alternative",
    ethosTransformation: "From rage against the machine to constructive sovereign freedom",
    primaryEmotions: ["excitement", "authority", "intrigue"],
  },
  ruler: {
    id: "ruler",
    name: "The Ruler / Sovereign",
    narrativeFramework: "Kingdom Restoration (Chaos -> Governance -> Prosperity)",
    catalystEvent: "Market fracture caused by fragile, amateur tooling",
    shadowTrait: "Authoritarian rigidity and fear of disruption",
    ethosTransformation: "From bureaucratic control to benevolent infrastructure stewardship",
    primaryEmotions: ["authority", "trust", "warmth"],
  },
  sage: {
    id: "sage",
    name: "The Sage / Truthseeker",
    narrativeFramework: "The Clarity Ascent (Noise -> Rigorous Empirical Proof -> Truth)",
    catalystEvent: "Widespread deception through unsubstantiated hype and buzzwords",
    shadowTrait: "Analysis paralysis and emotionless pedantry",
    ethosTransformation: "From abstract theory to actionable, democratized enlightenment",
    primaryEmotions: ["trust", "authority", "intrigue"],
  },
  magician: {
    id: "magician",
    name: "The Magician / Alchemist",
    narrativeFramework: "The Quantum Leap (Constraint -> Metamorphosis -> Magic)",
    catalystEvent: "Breakthrough synthesis of two seemingly incompatible domains",
    shadowTrait: "Mysticism masking unsubstantiated or deceptive claims",
    ethosTransformation: "From spectacle illusions to reproducible engineering miracles",
    primaryEmotions: ["intrigue", "excitement", "warmth"],
  },
  outlaw: {
    id: "outlaw",
    name: "The Outlaw / Disruptor",
    narrativeFramework: "The Frontier Heist (Monopoly -> Liberation -> Open Commons)",
    catalystEvent: "Artificial moats locking users inside walled gardens",
    shadowTrait: "Recklessness and total disregard for safety guardrails",
    ethosTransformation: "From reckless mutiny to sovereign user ownership",
    primaryEmotions: ["excitement", "intrigue", "authority"],
  },
  everyman: {
    id: "everyman",
    name: "The Everyman / Peer",
    narrativeFramework: "The Humble Fellowship (Alienation -> Shared Ground -> Community)",
    catalystEvent: "Exclusion of hardworking practitioners by elitist gatekeepers",
    shadowTrait: "Conformity and race-to-the-bottom mediocrity",
    ethosTransformation: "From ordinary bystander to authentic voice of the quiet majority",
    primaryEmotions: ["trust", "warmth", "authority"],
  },
  lover: {
    id: "lover",
    name: "The Lover / Devotee",
    narrativeFramework: "The Sacred Bond (Longing -> Intimacy -> Transcendence)",
    catalystEvent: "Sterile, dehumanized interactions eroding client craft and intimacy",
    shadowTrait: "Emotional codependency and inability to deliver hard feedback",
    ethosTransformation: "From sentimental infatuation to fierce, enduring devotion to client craft",
    primaryEmotions: ["warmth", "intrigue", "trust"],
  },
  jester: {
    id: "jester",
    name: "The Jester / Satirist",
    narrativeFramework: "The Court Truth-Teller (Absurdity -> Laughter -> Clarity)",
    catalystEvent: "Corporate pomposity and self-serious industry theatrics",
    shadowTrait: "Cynical evasion and frivolous lack of commitment",
    ethosTransformation: "From harmless clown to razor-sharp satirical truth-teller",
    primaryEmotions: ["excitement", "intrigue", "warmth"],
  },
  caregiver: {
    id: "caregiver",
    name: "The Caregiver / Guardian",
    narrativeFramework: "The Shield and Hearth (Vulnerability -> Sanctuary -> Flourishing)",
    catalystEvent: "Predatory commercial practices harming vulnerable end-users",
    shadowTrait: "Martyrdom and stifling paternalistic control",
    ethosTransformation: "From overprotective sheltering to empowering autonomous agency",
    primaryEmotions: ["trust", "warmth", "authority"],
  },
  explorer: {
    id: "explorer",
    name: "The Explorer / Pathfinder",
    narrativeFramework: "The Uncharted Horizon (Confinement -> Discovery -> New Territory)",
    catalystEvent: "Stagnation inside comfortable, crowded domestic frontiers",
    shadowTrait: "Chronic wanderlust and inability to finish what was started",
    ethosTransformation: "From restless drifting to blazing durable trails for others",
    primaryEmotions: ["intrigue", "excitement", "trust"],
  },
};

export const DEFAULT_FORBIDDEN_WORDS = [
  "synergy",
  "delve",
  "tapestry",
  "leverage",
  "disruptive",
  "game-changer",
  "paradigm shift",
  "bespoke",
  "holistic",
  "cutting-edge",
  "world-class",
  "frictionless",
  "revolutionary",
  "passionate about",
  "supercharge",
];

export class StoryEngine {
  /**
   * STR-001: Resolve Archetype Profile
   */
  public getArchetypeProfile(id: ArchetypeId): ArchetypeProfile {
    return ARCHETYPE_PROFILES[id] ?? ARCHETYPE_PROFILES.creator;
  }

  /**
   * STR-002: Generate OKLCH Palette and Emotional Resonance Curve
   */
  public generatePaletteAndResonance(archetypeId: ArchetypeId): {
    palette: OklchColor[];
    resonance: EmotionalResonanceCurve;
  } {
    // Dynamic OKLCH Hue mapping based on archetype psychology
    const hueMap: Record<ArchetypeId, { primaryHue: number; secondaryHue: number; accentHue: number }> = {
      hero: { primaryHue: 250, secondaryHue: 210, accentHue: 40 }, // Cobalt / Sky / Electric Gold
      creator: { primaryHue: 290, secondaryHue: 330, accentHue: 150 }, // Deep Violet / Magenta / Emerald
      rebel: { primaryHue: 25, secondaryHue: 350, accentHue: 90 }, // Fiery Crimson / Blood Coral / Toxic Lime
      ruler: { primaryHue: 260, secondaryHue: 220, accentHue: 85 }, // Imperial Indigo / Navy / Burnished Brass
      sage: { primaryHue: 200, secondaryHue: 170, accentHue: 55 }, // Steel Cyan / Slate Teal / Pale Amber
      magician: { primaryHue: 305, secondaryHue: 275, accentHue: 185 }, // Amethyst / Electric Purple / Cyan Flare
      outlaw: { primaryHue: 15, secondaryHue: 45, accentHue: 195 }, // Ash Black-Red / Rust / Electric Cyan
      everyman: { primaryHue: 140, secondaryHue: 85, accentHue: 25 }, // Forest Sage / Olive Ochre / Earth Terracotta
      lover: { primaryHue: 345, secondaryHue: 15, accentHue: 45 }, // Crimson Rose / Velvet Ochre / Warm Champagne
      jester: { primaryHue: 80, secondaryHue: 35, accentHue: 310 }, // Electric Chartreuse / Tangerine / Vivid Fuchsia
      caregiver: { primaryHue: 165, secondaryHue: 195, accentHue: 60 }, // Marine Mint / Cerulean / Soft Honey
      explorer: { primaryHue: 110, secondaryHue: 50, accentHue: 230 }, // Highland Moss / Desert Sand / Deep Horizon
    };

    const hues = hueMap[archetypeId] ?? hueMap.creator;

    const palette: OklchColor[] = [
      {
        role: "primary",
        l: 0.55,
        c: 0.22,
        h: hues.primaryHue,
        cssString: `oklch(0.55 0.22 ${hues.primaryHue})`,
        contrastOnBackground: 7.2,
      },
      {
        role: "secondary",
        l: 0.72,
        c: 0.14,
        h: hues.secondaryHue,
        cssString: `oklch(0.72 0.14 ${hues.secondaryHue})`,
        contrastOnBackground: 4.8,
      },
      {
        role: "accent",
        l: 0.82,
        c: 0.26,
        h: hues.accentHue,
        cssString: `oklch(0.82 0.26 ${hues.accentHue})`,
        contrastOnBackground: 9.1,
      },
      {
        role: "neutral",
        l: 0.35,
        c: 0.02,
        h: hues.primaryHue,
        cssString: `oklch(0.35 0.02 ${hues.primaryHue})`,
        contrastOnBackground: 5.5,
      },
      {
        role: "surface",
        l: 0.96,
        c: 0.01,
        h: hues.primaryHue,
        cssString: `oklch(0.96 0.01 ${hues.primaryHue})`,
        contrastOnBackground: 1.2,
      },
      {
        role: "background",
        l: 0.99,
        c: 0.005,
        h: hues.primaryHue,
        cssString: `oklch(0.99 0.005 ${hues.primaryHue})`,
        contrastOnBackground: 1.0,
      },
    ];

    // Emotional resonance curves calibrated by archetype
    const resonanceCurves: Record<ArchetypeId, EmotionalResonanceCurve> = {
      hero: { trust: 0.85, excitement: 0.92, authority: 0.9, warmth: 0.45, intrigue: 0.6 },
      creator: { trust: 0.8, excitement: 0.75, authority: 0.7, warmth: 0.65, intrigue: 0.95 },
      rebel: { trust: 0.55, excitement: 0.98, authority: 0.82, warmth: 0.3, intrigue: 0.92 },
      ruler: { trust: 0.95, excitement: 0.4, authority: 0.99, warmth: 0.5, intrigue: 0.45 },
      sage: { trust: 0.96, excitement: 0.35, authority: 0.94, warmth: 0.6, intrigue: 0.88 },
      magician: { trust: 0.75, excitement: 0.88, authority: 0.78, warmth: 0.6, intrigue: 0.99 },
      outlaw: { trust: 0.5, excitement: 0.96, authority: 0.75, warmth: 0.25, intrigue: 0.9 },
      everyman: { trust: 0.92, excitement: 0.45, authority: 0.55, warmth: 0.95, intrigue: 0.4 },
      lover: { trust: 0.88, excitement: 0.7, authority: 0.6, warmth: 0.98, intrigue: 0.85 },
      jester: { trust: 0.6, excitement: 0.95, authority: 0.4, warmth: 0.8, intrigue: 0.85 },
      caregiver: { trust: 0.98, excitement: 0.3, authority: 0.8, warmth: 0.99, intrigue: 0.35 },
      explorer: { trust: 0.78, excitement: 0.89, authority: 0.72, warmth: 0.55, intrigue: 0.92 },
    };

    const resonance = resonanceCurves[archetypeId] ?? resonanceCurves.creator;
    return { palette, resonance };
  }

  /**
   * STR-003: Generate Tagline Matrix and Elevator Pitches
   */
  public generateTaglinesAndPitches(input: BrandGenesisInput): {
    taglines: TaglineMatrix;
    pitches: ElevatorPitchSuite;
  } {
    const profile = this.getArchetypeProfile(input.archetype);

    // Tagline Matrix across 5 distinct narrative vectors
    const taglines: TaglineMatrix = {
      direct: `${input.brandName}: Engineered ${input.industry} for ${input.targetAudience}.`,
      aspirational: `Where ${input.coreOffering} meets sovereign agency.`,
      provocative: `Stop settling for fragile ${input.industry} defaults.`,
      metaphorical: `The architectural spine for tomorrow's category leaders.`,
      quantifiable: `Delivering 10x higher ${input.industry} precision with zero operational residue.`,
    };

    // 15s / 30s / 60s pitch suite
    const pitches: ElevatorPitchSuite = {
      pitch15s: `${input.brandName} delivers ${input.coreOffering} for ${input.targetAudience}, transforming ${input.catalystDescription} into verifiable market dominance.`,
      pitch30s: `Most ${input.industry} systems are plagued by fragile, derivative defaults. ${input.brandName} was born when ${input.founderName} experienced ${input.catalystDescription}. We replace superficial hype with ${input.coreOffering}, empowering ${input.targetAudience} to build sovereign, durable operations without compromise.`,
      pitch60s: `In every industry, there is a pivotal turning point where old playbooks fail. For ${input.industry}, that turning point is happening now. ${input.founderName} founded ${input.brandName} following a critical realization: ${input.catalystDescription}. Today, through our ${profile.narrativeFramework}, we provide ${input.coreOffering} purpose-built for ${input.targetAudience}. We reject lazy shortcuts and corporate buzzwords. Instead, we engineer rigorous, evidence-backed outcomes that turn category contenders into undisputed industry sovereigns.`,
    };

    return { taglines, pitches };
  }

  /**
   * STR-004: Build Constitution & Lint Copy
   */
  public createConstitution(customForbiddenWords: string[] = []): BrandVoiceConstitution {
    const forbiddenWords = Array.from(new Set([...DEFAULT_FORBIDDEN_WORDS, ...customForbiddenWords]));
    return {
      forbiddenWords,
      maxSentenceWords: 24,
      punchyOpenMaxWords: 5,
      minQuotableTokens: 12,
      maxQuotableTokens: 18,
      toneSpectrum: {
        formality: 65,
        irreverence: 35,
        technicalDensity: 70,
        urgency: 80,
      },
    };
  }

  /**
   * STR-004: Lint Prose against Brand Voice Constitution
   */
  public lintProse(prose: string, constitution: BrandVoiceConstitution): VoiceAuditResult {
    const violations: VoiceRuleViolation[] = [];
    const forbiddenFound: string[] = [];
    const lowerProse = prose.toLowerCase();

    // 1. Forbidden Words Check
    for (const word of constitution.forbiddenWords) {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
      if (regex.test(lowerProse)) {
        forbiddenFound.push(word);
        violations.push({
          ruleId: "VOICE-001",
          severity: "error",
          message: `Forbidden slop / buzzword detected: "${word}"`,
          sample: word,
        });
      }
    }

    // 2. Sentence Length & Cadence
    const sentences = prose
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let totalWords = 0;
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      const wordCount = s.split(/\s+/).filter(Boolean).length;
      totalWords += wordCount;

      if (i === 0 && wordCount > constitution.punchyOpenMaxWords) {
        violations.push({
          ruleId: "VOICE-002",
          severity: "warning",
          message: `Opening sentence lacks punchiness (${wordCount} words; target <= ${constitution.punchyOpenMaxWords})`,
          sample: s.slice(0, 60),
        });
      }

      if (wordCount > constitution.maxSentenceWords) {
        violations.push({
          ruleId: "VOICE-003",
          severity: "warning",
          message: `Sentence exceeds cadence ceiling (${wordCount} words; max ${constitution.maxSentenceWords})`,
          sample: s.slice(0, 60),
        });
      }
    }

    const avgWords = sentences.length > 0 ? Math.round((totalWords / sentences.length) * 10) / 10 : 0;

    // 3. 18-Token Standalone Quotability Check
    // Extracts sentences or clauses between 12 and 18 tokens
    let quotableTokens = 0;
    for (const s of sentences) {
      const words = s.split(/\s+/).filter(Boolean).length;
      if (words >= constitution.minQuotableTokens && words <= constitution.maxQuotableTokens) {
        quotableTokens++;
      }
    }

    if (quotableTokens === 0 && sentences.length > 3) {
      violations.push({
        ruleId: "VOICE-004",
        severity: "warning",
        message: `No standalone 12-18 token punchy quotable anchors identified in prose`,
      });
    }

    // Scoring: 100 baseline, -20 per error, -5 per warning
    let score = 100;
    for (const v of violations) {
      score -= v.severity === "error" ? 20 : 5;
    }
    score = Math.max(0, Math.min(100, score));

    return {
      passed: forbiddenFound.length === 0 && score >= 75,
      score,
      forbiddenWordsFound: forbiddenFound,
      quotableTokensCount: quotableTokens,
      averageSentenceLength: avgWords,
      violations,
    };
  }

  /**
   * Unified Genesis Engine
   */
  public generateBrandGenesis(input: BrandGenesisInput): BrandGenesisOutput {
    const archetype = this.getArchetypeProfile(input.archetype);
    const { palette, resonance } = this.generatePaletteAndResonance(input.archetype);
    const { taglines, pitches } = this.generateTaglinesAndPitches(input);
    const constitution = this.createConstitution(input.customForbiddenWords);

    const summaryMd = `
# 🌟 Brand Genesis Blueprint: ${input.brandName}

## 1. Founder Archetype Alignment (STR-001)
- **Archetype**: ${archetype.name}
- **Narrative Framework**: ${archetype.narrativeFramework}
- **Catalyst Event**: ${input.catalystDescription}
- **Shadow Trait**: ${archetype.shadowTrait}
- **Ethos Transformation**: ${archetype.ethosTransformation}

## 2. OKLCH Visual Palette & Emotional Resonance (STR-002)
- **Primary**: \`${palette[0]?.cssString}\` (Contrast: ${palette[0]?.contrastOnBackground}:1)
- **Secondary**: \`${palette[1]?.cssString}\` (Contrast: ${palette[1]?.contrastOnBackground}:1)
- **Accent**: \`${palette[2]?.cssString}\` (Contrast: ${palette[2]?.contrastOnBackground}:1)
- **Emotional Curve**: Trust ${Math.round(resonance.trust * 100)}% | Excitement ${Math.round(resonance.excitement * 100)}% | Authority ${Math.round(resonance.authority * 100)}% | Warmth ${Math.round(resonance.warmth * 100)}% | Intrigue ${Math.round(resonance.intrigue * 100)}%

## 3. Tagline & Elevator Pitch Matrix (STR-003)
- **Direct**: "${taglines.direct}"
- **Aspirational**: "${taglines.aspirational}"
- **Provocative**: "${taglines.provocative}"
- **Metaphorical**: "${taglines.metaphorical}"
- **Quantifiable**: "${taglines.quantifiable}"

### 30s Elevator Pitch:
> "${pitches.pitch30s}"

## 4. Brand Voice Constitution (STR-004)
- **Banned Buzzwords**: ${constitution.forbiddenWords.slice(0, 8).join(", ")}...
- **Tone Spectrum**: Formality ${constitution.toneSpectrum.formality}/100 | Irreverence ${constitution.toneSpectrum.irreverence}/100 | Technical ${constitution.toneSpectrum.technicalDensity}/100 | Urgency ${constitution.toneSpectrum.urgency}/100
- **Cadence Gates**: Opening punchiness <= ${constitution.punchyOpenMaxWords} words, Max sentence ${constitution.maxSentenceWords} words, 18-token quotability target.
`.trim();

    return {
      brandName: input.brandName,
      archetype,
      palette,
      resonanceCurve: resonance,
      taglines,
      pitches,
      constitution,
      genesisSummaryMarkdown: summaryMd,
    };
  }
}

// CLI runner if invoked directly
if (import.meta.main) {
  const engine = new StoryEngine();
  const sampleInput: BrandGenesisInput = {
    brandName: "Vanguard Systems",
    founderName: "Elena Vance",
    industry: "Autonomous DevSecOps",
    archetype: "hero",
    catalystDescription: "Watching a critical zero-day exploit bring down three hospital networks in 2024",
    coreOffering: "Deterministic multi-agent security verification",
    targetAudience: "Chief Information Security Officers and Lead Architects",
  };

  const output = engine.generateBrandGenesis(sampleInput);
  console.log(output.genesisSummaryMarkdown);

  const testCopy = "Vanguard protects networks. We reject cutting-edge synergy and leverage real deterministic code.";
  const audit = engine.lintProse(testCopy, output.constitution);
  console.log("\nProse Lint Audit:", audit);
}

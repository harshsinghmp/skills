# video — Video: hooks, structure, shot direction, short-form reels/shorts, long-form essays, and HeyFrames AI editing.

## Intake

- Platform format and target aspect ratio (9:16 vertical for TikTok/Reels/Shorts, 16:9 widescreen for YouTube/Explainer/Loom)
- Target duration (15–60s short-form, 8–15m long-form YouTube, 2–3m product explainer)
- Single core payoff the viewer came for
- Source material: raw footage, podcast/interview recording, screen-capture demo, or script from scratch
- Tooling pipeline: HeyFrames (AI auto-reframe, speaker tracking, viral captions), Remotion / Hyperframes (code-rendered), DaVinci Resolve / Premiere Pro (manual edit).

## Deliverable

A shooting- or editing-ready video production packet:
1. **The First-3-Second Hook**: Visual hook, spoken hook, and on-screen text hook synchronized with zero cognitive lag.
2. **Beat-by-Beat Production Script**: Scene/shot number, visual & camera direction, spoken dialogue/VO, on-screen text overlays, and sound design (SFX) cues.
3. **HeyFrames & Automated AI Editing Specs**: Auto-reframe crop targets (16:9 to 9:16), active speaker tracking rules, kinetic subtitle styling, and contextual B-roll placement.
4. **Packaging Matrix**: 3 non-overlapping title/thumbnail concept pairs for long-form, or caption + trending audio strategy for short-form.

## Procedure

### 1. Short-Form Video Strategy (Reels, TikTok, YouTube Shorts)
- **The 3-Second Retention Law**: The viewer decides to scroll within 1.5–3 seconds. Hook simultaneously on three sensory layers:
  - *Spoken Hook*: State the contrarian claim or open an irresistible curiosity loop (*"Stop using useEffect for data fetching..."*).
  - *Visual Hook*: Movement toward the camera, pattern interrupt, or provocative split screen.
  - *Text Hook*: High-contrast, center-screen text confirming the problem statement.
- **Micro-Pacing & Retention Curves**:
  - Insert a visual or sonic pattern interrupt every 2.5 to 3.5 seconds (zoom cut, camera angle shift, B-roll overlay, SFX whoosh/pop).
  - Zero dead air: trim all pauses between sentences to 0.1s; overlap dialogue slightly with B-roll transitions (J-cuts and L-cuts).
  - The Loop Finish: Construct the final sentence to flow seamlessly back into the opening hook for infinite replay loops.

### 2. Long-Form Video Strategy (YouTube, Explainers, Video Essays)
- **Retention Graph Management**:
  - *First 30 Seconds*: Confirm the promise of the title/thumbnail immediately. No channel logos, no "Hey guys welcome back".
  - *Narrative Loops*: Introduce the macro question in Act 1, answer minor sub-questions in Act 2, and deliver the master revelation in Act 3.
  - *Chapter Architecture*: Structure clear chapters (`[00:00] The Hook`, `[02:15] Why The Obvious Solution Fails`, `[06:40] The 3-Step Protocol`) for YouTube search indexing.
- **Packaging Synergy**:
  - Rule: The thumbnail and title must **never** repeat the same words. The title provides context; the thumbnail creates emotional curiosity. Deliver 3 distinct angle pairs.

### 3. HeyFrames & Automated AI Video Workflows
- **Intelligent Aspect Ratio Reframing**:
  - Convert 16:9 horizontal podcast, webinar, or tutorial footage into 9:16 vertical short-form without letterboxing.
  - Apply automated face detection and active speaker tracking: ensure the speaker remains centered with optimal headroom (top 15% margin).
  - In multi-speaker interviews, use dynamic split-screen stacking (speaker on top, listener/reactor on bottom) or automated cut-on-speech triggers.
- **Kinetic Subtitle Engineering**:
  - Auto-generate word-level synchronized captions.
  - Style: Bold sans-serif (e.g., Montserrat, The Bold Font), high-contrast white text with black outline and yellow/green active-word highlight.
  - Positioning: Place captions in the vertical safe zone (between 35% and 65% height) to prevent overlap with platform UI (TikTok description, Instagram like buttons).
- **Automated B-roll & SFX Layering**:
  - Trigger contextual B-roll or screenshot zooms whenever technical terms or abstract concepts are mentioned.
  - Layer subtle audio cues: whoosh on slide-in, pop on text badge appearance, riser before payoff moment.

### 4. Technical Mastering & Automated Ingestion Standards
- **Loudness**: Master long-form YouTube to `-14.0 LUFS` (true peak `-1.0 dBTP`); master social short-form (Reels/TikTok) to `-15.0 to -16.0 LUFS` to prevent aggressive mobile platform limiter pumping.
- **Export Standards**: H.264 / H.265, 4K or 1080p, 60fps or 24fps (consistent frame cadence), Rec.709 color space.
- **Automated Video Ingest & Vision Fallback (Openshorts Pipeline)**:
  - *URL Ingest Allowlisting*: When pulling source videos via CLI or API, enforce strict single-video URL parsing (rejecting playlist, channel, or stream containers that trigger infinite scrapers or proxy bans).
  - *Handle-Based Direct Streaming*: Stream media buffers directly to multimodal AI engines (Gemini/OpenAI) by file handle or authenticated stream, avoiding temporary unmanaged disk dumps.
  - *Vision Fallback for Silent Footage*: When transcribing video assets, if Speech-to-Text (ASR) returns zero spoken dialogue (e.g. gameplay VODs, silent tutorials, ambient product reels), seamlessly fall back to visual frame analysis. Extract key motion frames, describe on-screen actions, and automatically generate synthetic narrative hooks and captions.
  - *GPU & ASR Memory Lifecycle*: Explicitly release automated speech recognition (Whisper) and video reframing models immediately after transcription batches to prevent GPU out-of-memory crashes during multi-asset processing.

## Quality gate

- [ ] Hook lands within the first 3 seconds across visual, audio, and text layers.
- [ ] Pacing enforces a pattern interrupt every 2.5–3.5 seconds in short-form.
- [ ] No title-thumbnail word repetition for long-form packaging; 3 angle pairs provided.
- [ ] HeyFrames safe-zone margins (35%–65% vertical) respected for captions and overlays.
- [ ] Audio mastered to -14 LUFS (YouTube) or -16 LUFS (Reels/TikTok) with -1.0 dBTP ceiling.
- [ ] Spoken lines written for natural human speech, free of tongue-tripping corporate jargon.

## Sources

- YouTube Creator Academy Retention & Packaging Engineering Guidelines.
- HeyFrames & OpusClip Automated Reframing and Kinetic Caption Architecture.
- MrBeast & Colin and Samir Hook and Retention Pacing Frameworks.

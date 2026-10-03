# podcast — Podcast: show positioning, guest intake, scripting, audio specs, show notes, and distribution.

## Intake

- Show format (solo, co-host, guest interview, narrative documentary, panel)
- Episode title hypothesis and core listener payoff ("By the end of this episode, the listener will understand...")
- Guest background, bio, notable perspectives, and contrarian angles
- Target duration (15–20m solo flash, 45–60m deep interview)
- Sponsorship or affiliate obligations (mid-roll cues, custom URL/code)
- Default stack: Descript / DaVinci Fairlight for audio edit, Auphonic for loudness normalization, Transistor / Spotify for Podcasters for RSS distribution.

## Deliverable

A full podcast production packet:
1. **Guest Dossier & Intake**: 5 non-obvious curiosity hooks, talking point boundaries, and pre-roll icebreaker questions.
2. **Episode Script / Flow**: Cold open hook (0:00–0:45), music timing, thesis intro, 3–4 narrative beats, sponsor transition, actionable takeaways, and outro CTA.
3. **Broadcast Audio Engineering Specs**: Strict loudness (-16 LUFS stereo, -19 LUFS mono) and frequency guidelines.
4. **SEO Show Notes**: Catchy title, 2-sentence hook, timestamped chapters, resource links, and transcript highlights.
5. **Multi-Platform Repurposing Kit**: 3 audio snippet hooks (<60s with audiogram visual cues), 1 newsletter tie-in summary, and 3 social quote cards.

## Procedure

1. **Lock Show Concept & Angle**:
   - Determine the single thesis. Never ask generic "Tell us about your background" questions; start with the inflection point or contrarian belief.
   - For guest interviews, research past appearances and deliberately skip stories they have told on three other podcasts.
2. **Structure the Narrative Beats**:
   - **Cold Open (0:00–0:45)**: The most provocative 15–30 second quote from the episode. No music, high stakes.
   - **Show Intro & Thesis (0:45–2:00)**: Introduce the guest, frame why this topic matters *today*, and state the explicit listener payoff.
   - **Core Segments (3–4 blocks)**: Build from problem breakdown → actionable mechanism → tactical case study → future prediction.
   - **Sponsor Read**: Seamless organic bridge (never jarring). E.g., *"Speaking of optimizing workflows, that's exactly why we use [Sponsor]..."*
   - **Outro & CTA**: One specific action (e.g., download the cheat sheet, subscribe to the feed, share with one colleague).
3. **Enforce Audio Engineering Standards**:
   - **Loudness Normalization**: Master stereo episodes to `-16.0 LUFS` (±1.0 LUFS); mono episodes to `-19.0 LUFS` (Apple Podcasts & Spotify broadcast standard).
   - **True Peak Ceiling**: `-1.0 dBTP` maximum to prevent inter-sample distortion during lossy AAC/MP3 transcoding.
   - **Noise & Room Treatment**: Noise floor below `-60 dBFS`. High-pass filter at `80 Hz` (24 dB/octave) to eliminate air handler rumble, mic stand bumps, and plosive thumps.
   - **Vocal EQ & Dynamics**: De-ess harsh sibilance at `5 kHz – 8 kHz`. Gentle presence lift at `3 kHz – 5 kHz`. Compress with `2:1 to 3:1` ratio, slow attack (30ms), auto-release to preserve human dynamic nuance.
4. **Author SEO Show Notes & Timestamps**:
   - Write timestamped chapter markers matching ID3 and YouTube specs (`[00:00] Cold Open`, `[03:15] The $10M Architectural Mistake`).
   - Format show notes with clickable resource URLs, guest social handles, and structured bullet takeaways for search indexation.
5. **Generate Multi-Platform Repurposing Cuts**:
   - Identify 3 viral soundbites (under 60 seconds) with clear emotional or educational punches.
   - Provide visual cues for audiograms or HeyFrames vertical video reframing (speaker zoom, kinetic word-by-word captions).

## Quality gate

- [ ] Single listener payoff explicit before scripting.
- [ ] Cold open quote lands within first 45 seconds.
- [ ] No generic background questions; interview probes contrarian insights.
- [ ] Audio master meets -16 LUFS stereo (-19 LUFS mono) with -1.0 dBTP ceiling.
- [ ] 80 Hz high-pass filter applied to all spoken voice tracks.
- [ ] Timestamped chapter markers provided with zero formatting errors.
- [ ] Show notes include resource citations and guest links.
- [ ] 3 short-form repurposing soundbites identified with timestamps.

## Sources

- Apple Podcasts & Spotify Audio Delivery Specifications (-16 LUFS, -1.0 dBTP).
- Tim Ferriss & Guy Raz Narrative Interview Methodology (inflection-point framing).
- Descript & Auphonic Broadcast Engineering Protocols.

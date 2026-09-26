# carousel — Autonomous TikTok & Instagram Carousel Growth Engine

Autonomous multi-modal carousel pipeline: analyzes target websites using headless browser research, generates 6-slide visual narratives using Gemini image-to-image coherence, publishes directly to TikTok and Instagram with trending music via Upload-Post API, and refines future performance through an automated analytics feedback loop.

---

## Intake

- **Target Website URL**: The product, service, SaaS, or e-commerce landing page to analyze.
- **Target Platforms**: TikTok and Instagram (9:16 vertical mobile-first format).
- **Brand Tokens**: Extracted brand palette, typography, logo, and core value proposition.
- **Credentials**:
  - `GEMINI_API_KEY`: Generative image model (`gemini-3.1-flash-image-preview` / Imagen 3).
  - `UPLOADPOST_TOKEN` & `UPLOADPOST_USER`: Multi-platform publishing API (https://upload-post.com).
- **Default Stack**: Headless Playwright (research), Gemini API (visuals), Upload-Post / Postiz (publishing and analytics).

---

## Deliverables

1. **6-Slide Narrative Storyboard**:
   - Slide 1: High-impact Scroll-Stopping Hook (Bold question, counter-intuitive stat, or visceral pain point).
   - Slide 2: Problem Identification (Naming the user's hidden friction or wasted hours).
   - Slide 3: Agitation & Competitor Contrast (Highlighting the cost of inaction or why legacy tools fail).
   - Slide 4: Core Solution (Introducing the product's fundamental paradigm shift).
   - Slide 5: Flagship Feature & Proof (Concrete screenshot, statistic, or customer result).
   - Slide 6: High-Conversion CTA (Clear directional directive without bottom-20% obstruction).
2. **Visual Coherence Assets**:
   - 6 JPG images at 768×1376 resolution (9:16 vertical ratio).
   - Slide 1 establishes visual DNA (color palette, typography, lighting, aesthetic).
   - Slides 2–6 leverage image-to-image conditioning referencing Slide 1 for strict brand continuity.
3. **Optimized Multi-Platform Copy & Metadata**:
   - Platform-tailored captions with SEO/AEO-optimized keyword density.
   - TikTok title (max 90 characters) with high-intent discovery tags.
   - Trending background music activation (`auto_add_music=true`).
4. **Analytics Telemetry & Learning Record (`learnings.json`)**:
   - Tracking `request_id`, impressions, likes, shares, comments, and engagement rate.
   - Self-improving feedback loop recording top-performing hook styles and optimal posting windows.

---

## Procedure

### 1. Phase 1: Historical Telemetry & Feedback Analysis
Before drafting a new carousel, query historical performance to prioritize winning creative hooks:
1. **Fetch Performance Data**:
   - Query Upload-Post or Postiz analytics endpoints for the account:
     ```bash
     GET /api/uploadposts/total-impressions/{user}?platform=tiktok&breakdown=true
     GET /api/uploadposts/post-analytics/{request_id}
     ```
2. **Extract Winning Patterns**:
   - Evaluate hook style performance: Do question hooks outperform bold claims?
   - Identify peak engagement hours and days from previous 10–30 carousels.
   - Extract recommendations into persistent `learnings.json`.

---

### 2. Phase 2: Autonomous Website Research (Playwright)
Inspect the live target URL to extract ground truth instead of inventing generic copy:
1. **DOM & Content Scraping**:
   - Navigate target homepage, `/pricing`, `/features`, `/about`, and `/testimonials`.
   - Extract exact headline, value proposition, numerical customer proof, and pricing tiers.
2. **Visual Identity Extraction**:
   - Parse computed CSS for primary, secondary, and accent colors.
   - Extract logo SVG, typography hierarchy, and UI screenshots.
3. **Niche Classification & Pain Points**:
   - Classify business category: Developer Tools, B2B SaaS, E-Commerce, Consumer Mobile, or Agency.
   - Map 3 visceral, niche-specific pain points to feed the problem and agitation slides.

---

### 3. Phase 3: Gemini Visual Coherence Generation
Generate high-fidelity vertical slides enforcing strict narrative and formatting constraints:

#### Critical Formatting Standards
- **Format**: Strictly 9:16 vertical ratio (`768x1376` or `1080x1920`).
- **File Type**: **JPG only** (TikTok rejects PNG carousels).
- **Safe Zone Mandate**: Keep all text, logos, and critical focus items out of the **bottom 20%** of the frame (reserved for platform UI overlays: caption, music disc, share buttons).

#### Visual DNA & Image-to-Image Sequence
1. **Slide 1 (Master Anchor)**:
   - Generate Slide 1 using text prompt specifying the extracted brand colors, typography weight, and atmospheric aesthetic.
   - Save output as `slide-1.jpg`.
2. **Slides 2–6 (Image-to-Image Continuity)**:
   - Feed `slide-1.jpg` as the reference input image into the Gemini generation call for each subsequent slide.
   - This enforces identical color grading, font styling, illustration treatment, and ambient lighting across the full carousel.
3. **Vision Quality Verification**:
   - Run multimodal vision checks on all 6 generated slides:
     - Check 1: Text legibility and zero spelling errors.
     - Check 2: Zero critical content in the bottom 20% overlay zone.
     - Check 3: Visual style matches Slide 1 DNA.
   - If any slide fails, regenerate only that specific slide using `slide-1.jpg` as reference.

---

### 4. Phase 4: Direct Publishing & Tracking
Publish the validated 6-slide carousel simultaneously to feed:
1. **Upload-Post API Dispatch**:
   ```bash
   curl -X POST https://api.upload-post.com/api/upload_photos \
     -H "Authorization: Bearer ${UPLOADPOST_TOKEN}" \
     -F "platform[]=tiktok" \
     -F "platform[]=instagram" \
     -F "title=Why top developers are switching in 2026 #devtools #coding" \
     -F "caption=Full breakdown in slides. Read until slide 6 for the free migration link." \
     -F "auto_add_music=true" \
     -F "privacy_level=PUBLIC_TO_EVERYONE" \
     -F "async_upload=true" \
     -F "photos[]=@slide-1.jpg" \
     -F "photos[]=@slide-2.jpg" \
     -F "photos[]=@slide-3.jpg" \
     -F "photos[]=@slide-4.jpg" \
     -F "photos[]=@slide-5.jpg" \
     -F "photos[]=@slide-6.jpg"
   ```
2. **Metadata Logging**:
   - Capture `request_id` from the API response and log to `post-info.json`.
3. **Outcome Delivery**:
   - Report published live links, hook category, and next scheduled posting window.

---

## Quality Gate Checklist

- [ ] All 6 slides strictly follow the 6-slide narrative arc (Hook → Problem → Agitation → Solution → Feature → CTA).
- [ ] Aspect ratio is strictly 9:16 (768×1376), encoded as JPG.
- [ ] Bottom 20% safe zone is completely free of text or logos.
- [ ] Slides 2–6 visually inherit styling from Slide 1 via image-to-image reference conditioning.
- [ ] Auto-trending music enabled (`auto_add_music=true`) for TikTok algorithmic ranking.
- [ ] Credentials strictly loaded from environment variables (`GEMINI_API_KEY`, `UPLOADPOST_TOKEN`).

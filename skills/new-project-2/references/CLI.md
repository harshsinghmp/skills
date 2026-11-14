## CLI Usage & Flags Reference

```bash
# Interactive Mode (Prompts for Purpose -> Hierarchical Tree -> Stack)
bun skills/core-engine/new-project/scripts/new-project.ts

# 1-Click Agency Golden Presets
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> --preset=powerhouse
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> --preset=astro-mobile

# Granular Non-Interactive Mode
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> \
  --intent=ecommerce \
  --type=nextjs \
  --styling=hybrid \
  --animation=motion \
  --state=nanostores \
  --mobile=capacitor \
  --cms=payload \
  --puck \
  --ecommerce=medusa \
  --db=postgres \
  --auth=better-auth \
  --github \
  --non-interactive

# Full client onboarding (interactive interview, docs generated in tandem)
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> --onboard-client

# Full client onboarding from a JSON or Markdown intake file
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> --intake=./client-answers.json --non-interactive

# Granular client flags (answers prefill the intake docs and brand/context)
bun skills/core-engine/new-project/scripts/new-project.ts <targetPath> \
  --client-name="Acme Health LLC" \
  --client-brand="Acme Health" \
  --client-contact="Dana Lee" --client-email="dana@acme.health" \
  --business-model=b2b-saas --company-stage=seed --revenue-band=1m-10m \
  --industry="Healthcare" --audience="Regional clinics" \
  --problem="Manual paper intake" --offerings="Intake Suite, EHR Sync" \
  --competitors="Epic, Cerner" --objections="Price, Migration effort" \
  --launch-goal="50 clinics onboarded" --boundaries="Native mobile app, Multi-language" \
  --domain=acme.health --dns-provider=cloudflare --git-host=github \
  --payments=stripe --integrations=hubspot,segment \
  --engagement=fixed-scope --sla-tier=priority --budget="USD 40k" \
  --comms-channel=slack --comms-cadence=weekly \
  --kickoff-date=2026-11-10 --deadline=2027-02-01 \
  --access-items="DNS, GitHub org, Stripe account" \
  --non-interactive
```

| Flag | Type | Description |
| :--- | :--- | :--- |
| `-n, --name <name>` | String | Project name (default: directory basename) |
| `-p, --path <path>` | String | Target directory path |
| `--author <name>` | String | Project author or organization name |
| `--tagline <desc>` | String | Project mission or summary |
| `--audience <aud>` | String | Target audience or user persona |
| `--problem <prob>` | String | Core problem solved by the project |
| `--features <list>` | String | Comma-separated core features |
| `--industry <niche>`| String | Industry or vertical |
| `--offerings <items>`| String | Core catalog items or services |
| `--tone <tone>` | String | Brand voice / design aesthetic |
| `--palette <color>` | String | Brand theme: `slate` \| `indigo` \| `emerald` \| `amber` \| `violet` |
| `--first-milestone <m>` | String | Immediate next task / initial milestone |
| `--planned-milestones <l>`| String | Comma-separated planned milestones |
| `--agent-name <name>` | String | Agent name configured for this workspace; otherwise use the user's global assistant identity and prompt if unavailable |
| `--agent-role <role>` | String | Lead agent functional role description |
| `--constraint <text>` | String | Primary operational constraint or invariant |
| `--onboard-client` | Boolean | Run the full 5-section client onboarding interview and render every intake doc |
| `--skip-client-onboarding` | Boolean | Write only the brief; leave doc generation to a later agent pass |
| `--intake <path>` | String | Prefill onboarding from a JSON object or a Markdown `**Label**: value` brief |
| `--client-name <name>` | String | Client legal entity / company name |
| `--client-brand <name>` | String | Public brand / trade name |
| `--client-slug <slug>` | String | Stable client identifier (default: slugged brand name) |
| `--client-contact <name>` | String | Day-to-day client contact |
| `--client-role <role>` | String | Day-to-day contact role |
| `--client-email <email>` | String | Day-to-day contact email |
| `--decision-maker <name>` | String | Final approval stakeholder |
| `--tech-lead <name>` | String | Client-side technical lead |
| `--business-model <model>` | String | `b2b-saas` \| `b2c-ecommerce` \| `agency-service` \| `marketplace` \| `media-publisher` \| `nonprofit` \| `local-business` \| `enterprise` \| `custom` |
| `--company-stage <stage>` | String | `idea` \| `bootstrapped` \| `seed` \| `series-a` \| `growth` \| `enterprise` \| `established` |
| `--revenue-band <band>` | String | `pre-revenue` \| `<100k` \| `100k-1m` \| `1m-10m` \| `10m-100m` \| `100m+` |
| `--mission <text>` | String | Mission statement |
| `--vision <text>` | String | Vision statement |
| `--competitors <list>` | String | Comma-separated competitors |
| `--objections <list>` | String | Comma-separated customer objections |
| `--launch-goal <text>` | String | Single measurable launch-success metric |
| `--boundaries <list>` | String | Comma-separated explicit out-of-scope items |
| `--domain <domain>` | String | Primary production domain |
| `--dns-provider <name>` | String | `cloudflare` \| `route53` \| `namecheap` \| `godaddy` \| `vercel` \| `other` |
| `--git-host <host>` | String | `github` \| `gitlab` \| `bitbucket` \| `self-hosted` \| `none` |
| `--payments <list>` | String | Comma-separated payment rails |
| `--integrations <list>` | String | Comma-separated third-party services in use |
| `--brand-assets <path>` | String | Brand asset drive/folder location |
| `--figma <url>` | String | Figma or design file URL |
| `--sla-tier <tier>` | String | `standard` \| `priority` \| `enterprise` \| `none` |
| `--engagement <type>` | String | `fixed-scope` \| `retainer` \| `time-materials` \| `productized-sku` \| `internal` \| `oss` |
| `--comms-channel <channel>` | String | `slack` \| `email` \| `telegram` \| `whatsapp` \| `weekly-call` \| `other` |
| `--comms-cadence <cadence>` | String | `daily` \| `weekly` \| `biweekly` \| `monthly` \| `milestone` |
| `--kickoff-date <date>` | String | Engagement kickoff date (`YYYY-MM-DD`) |
| `--deadline <date>` | String | Hard delivery deadline (`YYYY-MM-DD`) |
| `--budget <text>` | String | Budget band or commercial ceiling |
| `--access-items <list>` | String | Comma-separated access items required from the client |
| `-i, --intent <intent>` | String | `brochure` \| `content` \| `ecommerce` \| `app` \| `mobile` \| `governance` |
| `--preset <preset>` | String | `powerhouse` \| `astro-commerce` \| `publisher` \| `edge` \| `visual` \| `astro-visual` \| `plain-astro` \| `git-cms` \| `instatic` \| `pure-html` \| `mobile` \| `astro-mobile` \| `atomic-payload` |
| `-t, --type <framework>` | String | `nextjs` \| `astro` \| `instatic` \| `wordpress` \| `expo` \| `custom` \| `none` |
| `-s, --styling <styling>` | String | `hybrid` (UnoCSS Wind 4 + BEM) \| `unocss` \| `bem` \| `tailwind` \| `custom` \| `none` |
| `-a, --animation <anim>` | String | `css` (Hardware presets) \| `motion` \| `gsap` \| `webgl` \| `custom` \| `none` |
| `--state <engine>` | String | `nanostores` (Sub-1KB cross-island store) \| `custom` \| `none` |
| `-m, --mobile <target>` | String | `capacitor` (Ionic Capacitor iOS/APK wrapper) \| `expo` (React Native) \| `custom` \| `none` |
| `-c, --cms <cms>` | String | `ariabuilder` \| `atomic-payload` \| `studiocms` \| `tina` \| `keystatic` \| `emdash` \| `payload` \| `wollycms` \| `decap` \| `keystone` \| `sanity` \| `strapi` \| `custom` \| `none` |
| `--puck` | Boolean | Enable Puck Visual Builder (for Payload CMS) |
| `-e, --ecommerce <ecom>` | String | `payload` \| `medusa` \| `vendure` \| `fastrr` \| `razorpay` \| `stripe` \| `custom` \| `none` |
| `--db <db>` | String | `neon` \| `supabase` \| `postgres` \| `sqlite` \| `custom` \| `none` |
| `--auth <auth>` | String | `better-auth` \| `supabase` \| `authjs` \| `custom` \| `none` |
| `--deploy <deploy>` | String | `cloudflare` \| `docker` \| `vercel` \| `custom` \| `none` |
| `--github` / `--no-github` | Boolean | Explicitly include or omit GitHub-specific files; interactive setup asks when unknown |
| `--skip-install` | Boolean | Skip running bun install |
| `--dry-run` | Boolean | Simulate without writing files |
| `--non-interactive` | Boolean | Run without interactive prompts |
| `-f, --force` | Boolean | Overwrite existing files |

---

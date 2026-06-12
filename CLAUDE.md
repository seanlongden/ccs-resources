# CCS Resources — Project Context

> **For Claude Code sessions.** Read this first. Saves Sean having to re-explain the project every session.

## What this is

**Closing Clients System (CCS) Resources** — a members-only content library that gates Sean's CCS course material behind a Stripe subscription + Google Sheets lifetime-member list.

- **Live URL**: https://ccs-resources-yl2ha.ondigitalocean.app/
- **Repo**: https://github.com/seanlongden/ccs-resources
- **Hosting**: DigitalOcean App Platform (auto-deploys on push to `main`)
- **Owner**: Sean Longden (seanlongden0@gmail.com)
- **Was previously CCG** (Closing Clients Group). Rebranded to CCS mid-2026. Some legacy CCG content still in chunks 0–21.

## Stack

- **Next.js 13** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + `@tailwindcss/typography`
- **iron-session** — encrypted session cookies
- **Stripe SDK** (v20) — subscription verification
- **marked** (v17) — markdown → HTML rendering with custom processors

## Directory layout (only what matters)

```
ccg-resources/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Login page (/)
│   │   ├── resources/
│   │   │   ├── page.tsx                # /resources landing (CCS INSTALL track + section grid)
│   │   │   └── [...slug]/page.tsx      # Dynamic route — handles ALL section + page URLs
│   │   └── api/
│   │       ├── auth/route.ts           # Login / logout / session
│   │       ├── content/page/route.ts   # Per-page content + search
│   │       └── content/navigation/route.ts  # Sidebar nav
│   └── lib/
│       ├── content.ts                  # JSON loading + caching
│       ├── content-renderer.ts         # Markdown → HTML (marked + pre/postprocess)
│       ├── auth.ts                     # checkAccess (Sheets + Stripe)
│       ├── stripe.ts                   # checkStripeSubscription
│       ├── lifetime-members.ts         # Google Sheets lookup
│       └── gating.ts                   # Per-page access rules
├── content/
│   ├── navigation.json                 # 10-section sidebar (source of truth for sections)
│   ├── page-index.json                 # Flat list of all 70 pages
│   ├── pages-0.json .. pages-21.json   # Legacy CCG content (FROZEN — don't edit)
│   ├── pages-100.json                  # Placeholder pages (Welcome, CCS INSTALL modules, section overviews)
│   ├── pages-101.json                  # Matt's CCS content (56 real pages)
│   └── gating-rules.json               # Per-page access rules (currently empty + default trial)
├── public/
│   └── icon.png                        # CCS brand mark
└── CLAUDE.md                           # This file
```

## Content pipeline — how a URL becomes HTML

1. User hits `/resources/set-up/cold-traffic-offer`
2. `src/app/resources/[...slug]/page.tsx` resolves slug → fetches `/api/content/page?slug=set-up/cold-traffic-offer`
3. API uses `src/lib/content.ts` → `getPage()` → looks slug up in `page-index.json` → finds `chunk: 101` → loads `pages-101.json` → returns the page object
4. Component passes `page.content` (markdown) through `src/lib/content-renderer.ts`:
   - **Preprocess**: tokenise Loom URLs / callout divs, strip duplicate H1, extract nav links
   - **Render**: `marked` with custom renderers (step badges, internal link styling, checkboxes)
   - **Postprocess**: replace tokens with styled HTML (Loom iframes, callout boxes)
5. Result injected via `dangerouslySetInnerHTML` with Tailwind prose classes

## Chunk conventions ⚠️ CRITICAL

| Chunk | What it holds | Editable? |
|---|---|---|
| `0`–`21` | Legacy CCG Notion export (~550 pages) | **FROZEN** — don't edit |
| `100` | Placeholder pages (Welcome, CCS INSTALL Modules 1–5, 8 section overviews) | Yes |
| `101` | Matt's CCS content (56 real pages, migrated from his HTML) | Yes |

**When adding a new page**: append to `pages-101.json` AND add the entry to `page-index.json` AND add a child to the correct section in `navigation.json`. All three must stay in sync.

## The 10 sections (current state)

| # | Section | Slug | Real pages | Placeholders |
|---|---|---|---|---|
| 1 | Welcome | `welcome` | 0 | 1 (overview) |
| 2 | CCS INSTALL | `ccs-install` | 0 | 5 modules |
| 3 | Key Resources | `key-resources` | 2 | 1 overview |
| 4 | Set Up | `set-up` | 8 | 1 overview |
| 5 | Offers, Guarantees & Case Studies | `offers-guarantees-case-studies` | 6 | 1 overview |
| 6 | Cold Email | `cold-email` | 12 | 1 overview |
| 7 | Sales | `sales` | 14 | 1 overview |
| 8 | Onboarding | `onboarding` | 3 | 1 overview |
| 9 | Hiring & Team | `hiring-team` | 7 | 1 overview |
| 10 | Operations & Scaling | `operations-scaling` | 4 | 1 overview |

**Total**: 56 real pages (chunk 101) + 14 placeholders (chunk 100) = 70 pages in `page-index.json`.

## Deploy pipeline

```
local edit → git commit → git push origin main → DigitalOcean detects → rebuilds → live in ~2 min
```

- DO auto-deploy is wired to `main` branch
- No staging environment
- DO App Spec lives in DO dashboard, not in repo
- Hard refresh (Cmd+Shift+R) after deploy to bust browser cache

## Local dev

```bash
cd /Users/seanlongden/Projects/ccg-resources
npm install
npm run dev
```

**⚠️ Port 5000 conflicts with macOS AirPlay Receiver.** If `npm run dev` fails or you can't reach `localhost:5000`, either:
- Disable AirPlay Receiver in System Settings → General → AirDrop & Handoff, OR
- Temporarily edit `package.json` `dev` script to `-p 3000` (don't commit)

**Env vars required** (in `.env.local`):
- `STRIPE_SECRET_KEY` (live key — `sk_live_...`)
- `GOOGLE_SHEET_ID` (lifetime members list)
- `SESSION_SECRET` (any 32+ char string)

Production env vars live in the DigitalOcean App Spec.

## Conventions

- **Slugs**: kebab-case, nested as `section/page-slug`
- **Sections** always have an overview page at `section/section-overview` (chunk 100)
- **Real CCS content** goes in chunk 101
- **Never edit chunks 0–21** — they're legacy CCG content, frozen
- **Voice**: en-GB, grade-4 reading level, no em-dashes, no exclamation marks (Sean's direct-response copywriting rules)
- **Internal links** in content: `/resources/section/page-slug` format
- **Loom embeds**: paste raw `https://loom.com/share/<id>` URLs — renderer auto-converts to responsive iframes
- **YouTube embeds**: links only, not auto-embedded yet
- **Callouts**: Notion-style `<div class="callout">...</div>` — preprocessor converts to styled boxes

## Known gotchas

1. **TOP_LEVEL_SLUGS used to be hardcoded** in `[...slug]/page.tsx`. Fixed to derive from `navigation.json` — if you re-introduce a hardcoded section list anywhere, the moment nav changes, sections 404. Always derive from `navigation.json`.
2. **No admin/owner content bypass.** If Sean's Stripe lapses, he's locked out of his own site. Login requires `hasAccess: true` from `checkAccess()` (Sheets OR Stripe).
3. **Port 5000 vs AirPlay**: documented above.
4. **Stripe key is LIVE** in production. Don't echo `STRIPE_SECRET_KEY` or commit `.env.local`.
5. **Content cache**: `src/lib/content.ts` caches `navigation.json` and `page-index.json` in module scope. Dev server picks up JSON edits on hot reload, but production needs a redeploy.
6. **Matt's original HTML source** lived at `/tmp/ccs_research/matts_resources/CCSresources/index.html`. Migration script (one-shot) at `/tmp/ccs_research/fix_matts_migration.py`. Both kept for reference — extraction is complete, no need to re-run.
7. **Markdown renderer escapes asterisks inside `<blockquote>`** — earlier migration bug. If you ever convert HTML callouts to markdown, use single-line `<p>ICON <strong>Label:</strong> body</p>` wrapping NOT `<blockquote>`, then markdownify. Otherwise asterisks render literal.
8. **DO deploy can lag a few minutes** after push. Don't assume "I pushed therefore it's live."

## When to update CLAUDE.md

Update this file when:
- A new section is added or section structure changes
- Chunk conventions change (e.g. new chunk number meaning)
- Deploy pipeline changes (host, branch, env vars)
- New gotcha discovered that bit someone

Don't update for: routine content edits, single-bug fixes, CSS tweaks.

## Live state files (refresh manually)

- `.claude/STATE.md` — what's done vs pending right now
- `.claude/URLS.md` — critical external links

If those files are stale (>1 month), check git log + `pages-101.json` page count to reconcile.

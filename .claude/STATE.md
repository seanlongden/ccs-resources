# CCS Resources — Migration State

**Last updated**: 2026-06-12

## Snapshot

- **Real content**: 56 pages (Matt's content, chunk 101)
- **Placeholders**: 14 pages (chunk 100 — Welcome, CCS INSTALL Modules 1–5, 8 section overviews)
- **Total addressable**: 70 pages
- **Legacy CCG**: chunks 0–21 (~550 pages, frozen, not surfaced in CCS nav)

## What's DONE

- ✅ Codebase rebrand CCG → CCS
- ✅ 10-section navigation structure (`content/navigation.json`)
- ✅ Matt's 56-page migration extracted from HTML → `pages-101.json`
- ✅ 51 quality bugs fixed (escaped asterisks ×36, broken blockquotes ×9, dropped video iframes ×6)
- ✅ TOP_LEVEL_SLUGS 404 bug fixed — now derives from `navigation.json` dynamically
- ✅ Landing page section-card grid surfacing 7 reference sections + Key Resources
- ✅ Stripe + Google Sheets auth wired
- ✅ DO auto-deploy on push to `main`
- ✅ CLAUDE.md context file

## What's PENDING (content writing)

| Item | Source needed | Priority |
|---|---|---|
| Welcome page | Sean's CCSYSTEM positioning | Medium |
| CCS INSTALL Module 1 — Pre-Install | CCSYSTEM/ROADMAP | High |
| CCS INSTALL Module 2 — System Install (Days 1–14) | CCSYSTEM/ROADMAP | High |
| CCS INSTALL Module 3 — Campaign Launch (Week 3) | CCSYSTEM/ROADMAP | High |
| CCS INSTALL Module 4 — Run + Optimise (Weeks 4–26) | CCSYSTEM/ROADMAP | High |
| CCS INSTALL Module 5 — Beyond 180 Days | CCSYSTEM/ROADMAP | Medium |
| 8 section overview pages | Optional — section-card grid covers discovery | Low |

## Known limitations

- No owner/admin bypass at login. If Sean's Stripe lapses, he's locked out.
- No visual distinction between placeholder + real pages on individual page views (overview pages say "Content launching soon").
- YouTube embeds render as links, not iframes (Loom does iframe).
- Search hits page content but not section descriptions.

## Update rules

- Refresh page counts after any content add to `pages-101.json`
- Refresh "DONE" list when a major item ships
- Refresh "PENDING" when content fills in
- If file is >2 weeks stale, treat counts as approximate and re-derive from `page-index.json`

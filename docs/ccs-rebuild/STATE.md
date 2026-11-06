# CCS Rebuild State

Updated 6 November 2026. Status: ACTUAL-APP CURRICULUM PREVIEW READY FOR SEAN'S REVIEW. Real system installation, live acceptance and some technical scope remain incomplete.

## Authority And Boundaries

Sean authorised all remaining lessons and assets on this private branch without per-page approval. Preserve the approved Start Here and Add The CCS Instructions To Grok Bot teaching standard. The full eleven-part plan remains in PLAN.md, including original source maps. Read PLAN.md, STATE.md, COVERAGE.md and QA.md when resuming; reread the full plan before each milestone.

No push, merge, publication, production/config/domain/database/credential/campaign/workflow change, original Drive edit, sending, booking, spending or other live action is authorised. No global instructions changed. Project memory, functional app assets and requested screenshots are authorised permanent files; disposable review captures are deleted after review.

## Worktree And Baselines

- Worktree: /Users/seanlongden/Projects/ccs-resources-preview.
- Branch: codex/ccs-resources-preview, no upstream.
- This run started at 19783fa36cbc4413f12ea490a5b16e814fddd33d. Final local commit is the Git commit containing this record; no remote branch was created.
- Protected original checkout: /Users/seanlongden/Projects/ccg-resources, clean main at 726c5772acb6b8af120f22ae8ddffa7e8c0ac40f. It was already 62 commits behind remote main. No credential files copied.
- Remote main at start and final read: 49cb29c5ac02eb001e3f3ed5c9c912aaa935ee7a. No external main-source change observed. Actual deployed SHA and DigitalOcean triggers remain unverified.
- Existing production content chunks 0-21, 100-102 and deployment configuration remain unchanged. Existing preview work preserved. Only approved welcome changed as a parsed object in chunk 103; other old Install objects remain unchanged.

## Working Preview

http://127.0.0.1:4327/resources/ccs-install/welcome

Run with Node24: node preview/next-app.mjs. This is the actual Next resources app, Sidebar, content route, renderer and LessonView. The old standalone renderer at 4326 is retained as legacy source and is not the review application.

The harness requires this branch, development mode, no local env files and loopback only. It clears inherited service credentials, uses student@preview.invalid, denies write methods and live-service APIs, and blocks external browser connections/forms/frames. It does not verify production authentication or subscriptions. Production auth logic is unchanged; the new asset route uses the existing session gate. No remote preview or phone-accessible hosting was deployed.

## Current Build

- 55 student pages: 11 Install, 35 supporting Resources, 8 Training and 1 full worked example. One additional private review-status page. 56 indexed lesson pages total.
- Six original Resource categories, three main tracks, worked example and asset library. Recordings hub/categories render with an explicit local-data notice.
- 16 full source-derived skills, version 0.2.0-preview. 52 editable templates, 25 worked files and 4 collector/cache/CSV tools. ZIP has 100 entries.
- 97 sources mapped individually, original plan destinations retained. 131 explicit old-route aliases. No ambiguous suffix/fuzzy resolution.
- Actual-app copy buttons, authenticated asset handler, search headings/anchors, mobile drawer and breadcrumb/next/category navigation.
- Frozen original lesson sources remain preserved. New curriculum lives in pages-104.json. build-curriculum.mjs regenerates nav/index/aliases/current source paths. Search index is generated locally and ignored by Git.
- Root dependency lock was repaired in the prior Start Here integration commit. package.json unchanged. Node24 used; host Node18 is insufficient.

## Phase Status

| Phase | Preview Result | Open Acceptance Condition |
|---|---|---|
| 1 Operating Specification | Written, product/cost facts updated and conflicts reconciled for review | Named work owners, supported stack, policy and handover approval |
| 2 Whole Example | Consistent filled example and deterministic workflow/failure tests | Real Grok, provider, calendar and AI calibration checks; real browser/paid-model route |
| 3 Student Material | Full curriculum and usable assets applied in actual app | Matt teaching review and fresh-student walkthrough |
| 4 Private Preview | Actual app, search/copy/download/navigation working locally | Real authentication/permission integration remains untested |
| 5 Student Review | 69 routes at desktop/phone, affected pages rechecked, failures fixed | Human comprehension and real operational walkthrough |
| 6 Review Handover | Local commit, preview, screenshots and records | Sean's review only; no publication authorised |

## Actual Checks

31 executable tests passed, zero failed/skipped. 29 cover current curriculum, workflow, collector and actual-app harness; 2 are separate legacy standalone regressions. Root TypeScript passed. Actual-app HTTP audit: 56 lesson pages, 10 section routes, 131 aliases, 86 byte-matched assets and four searches. All 69 rendered routes reviewed at 1440x1000 and 390x844, 32 affected routes rechecked at both sizes, followed by the two final collection/status page revisions at both sizes. No measured page/text overflow. Exact clipboard copy and browser ZIP download verified; search click now scrolls to its section, phone Menu/Escape, next/breadcrumb and single-lesson category clicks passed. QA.md records scope and limits.

## Teaching Decisions And Corrections

- Titles/headlines capitalise every word, including And/The/To. Plain British English, no generated student-copy em dashes.
- Explain the system and useful result, then exact actions, files, prompts, checks, failure route and next step. Preserve meaningful source detail in the skills and templates.
- Grok is researched from official docs, not an unidentified-product blocker. Current account execution and entitlements remain unverified.
- Stage-aware prerequisites allow intake before offer/fit files exist. All six Bots and the three voice files read by reply skills are explained.
- Agency acquisition and each client's cold-email delivery use separate profiles, senders, calendars, proof and settings. No SEO/paid-ad delivery promise added.
- Two cold steps, same-thread bump, tracking off, stop on reply and paused load. Interested-reply draft reminders are separate, proposed 24h/+1day/+2days pending Matt approval. Silence never authorises action.
- Broad research screening differs from final discovery/proposal thresholds. Unknown buyer economics, website status and email health stay unknown.
- Revenue/LTV/profit/cash timing separate. Worked terms distinguish 10-opportunity target, 5-opportunity payment milestone and 1-opportunity minimum remedy. These are illustrative, not historical results or live terms.
- Real public language notes are provider wording, not ten buyer interviews or proof of demand. Synthetic labels are not real AI accuracy.
- New-contact runway excludes follow-up sends. MX is not outbound IP. No near-time substitution or company-domain-only booking identity.
- LinkedIn optional/manual. Source 30/60-day activity-window conflict exposed as a proposed owner setting.
- Calendly's 3 November release now permits Scheduling API and standard webhooks on Free; actual scope/limits must be checked. Paid Standard is optional. Earlier paid-plan-only assumption corrected.

## Outstanding Decisions And Untested Requirements

1. Confirm CCS/student installation split and named handover reviewer; confirm the real student support destination. Supplied student-setup-support address failed DNS; use existing CCS channel meanwhile.
2. Select the supported real tool/account stack and permissions. Verify Grok saved skills/readback, secure connections, paused provider imports, reply/webhook receiving route, routines and real reports.
3. Matt approves the commercial teaching, qualification thresholds, reminder timing, optional LinkedIn settings and profile/sales-asset instructions.
4. Run real-company human-labelled AI calibration and current buyer/trigger research. Public provider wording and synthetic fixtures do not satisfy these.
5. Obtain exact copy/recipient/channel approval for controlled transport tests. No send/invite/booking test was authorised or performed.
6. B3 core tools now include a context-scoped SQLite company cache, a three-page collector, source fingerprints, proposed AI analysis import and row-preserving joins. Five Python cache cases and multi-page fixture tests pass. Automatic paid-model calls and browser fallbacks are not implemented; those await a confirmed supported route, permission and spending cap. Do not call those integrations tested.
7. Fresh student/human teaching walkthrough and demonstrated real system before Training handover. One booked meeting is not repeatable profitability.
8. Real production auth/subscription/download integration and live recording access are untested. Original external templates/videos were not reused as verified assets.
9. Deployed production SHA and actual deployment triggers remain unverified. No push allowed under the current instruction.

## Failure And Recovery Record

Earlier standalone preview did not meet Sean's actual-app requirement; it is superseded. Initial phone sidebar squeezed the lesson and desktop contents rail lost sticky behaviour; both corrected. Earlier search lacked heading IDs; current cross-lesson search also needed a post-mount section scroll, now corrected and browser verified. Single-child category auto-redirect created an unhelpful previous-link loop, removed. Self-alias was removed. Clipboard empty restoration fixed. An earlier download-event wait stalled; actual native download later succeeded and byte-matched the ZIP. Sandbox denied local sockets during final tests; authorised loopback rerun passed all 29 at that point, then all 31 after the cache extension. No live account was used to resolve these failures.

## Changed-File Summary

- Curriculum: content/pages-104.json, approved welcome link/metadata in pages-103.json, navigation, page index and explicit aliases. Frozen source chunks remain unchanged.
- Student assets: all sixteen skill boundaries, editable templates, full worked files, source map and versioned download in content/rebuild/.
- App: actual resources home/lesson routing, explicit alias resolution, prompt copy, matching search anchors, mobile navigation, session-gated downloads, whitelisted asset loader and local recordings fallback.
- Local tooling: curriculum/pack builders, read-only actual-app harness, CSV/website collector and local SQLite research cache. No live-service adapter is claimed tested.
- Checks: curriculum, actual-app HTTP, file boundaries, collector/cache, worked chain and workflow failure tests. Production auth and service credentials are not bypassed by published code.
- Recovery and review: scoped AGENTS.md, unchanged full original plan plus approval amendment, STATE/COVERAGE/QA/OPERATING-SPEC and four final actual-app screenshots.

## Exact Next Action

STOP for Sean's review of the working actual-app preview and local commit. Do not expand scope, push, merge, publish or activate accounts. On resumed feedback, first read these records and inspect the named page. Present changes to live assets before applying; preview-page edits are authorised within the existing rebuild scope. Real installation and remaining decisions must not be silently marked complete.

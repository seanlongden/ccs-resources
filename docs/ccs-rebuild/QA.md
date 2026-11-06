# CCS rebuild QA

Updated 6 November 2026. Review candidate only. No publication or live student handover has passed.

## Meaning of the labels
- Documented: a source or official product guide says this. Not proof of execution.
- Simulated: synthetic inputs replace a real system.
- Tested locally: an executable check passed within its stated scope.
- Unverified: account behaviour, access, external evidence or human judgement still needs checking.

## What passed
- 23 executable tests passed with bundled Node 24.22.1. Command: `node --test preview/tests/workflow.test.mjs preview/tests/example.test.mjs preview/tests/content.test.mjs preview/tests/scraper.test.mjs preview/tests/http.test.mjs` (using the bundled Node path on Sean's computer).
- All 28 coaching documents, 13 DWY documents and 56 existing main lessons have explicit destinations. The test checks coverage and source IDs, not full semantic equivalence or Matt's teaching approval.
- Nine Install steps, eight Training steps, all six resource categories and one consistent worked example exist. There are 53 lesson records in total.
- All seven teaching elements are present: output, prerequisites, teaching, AI instruction, owner actions, finished example and failure handling.
- All 65 page/hub routes returned HTTP 200. All 75 legacy source-page aliases returned the expected preview-only redirect. All 55 distinct linked downloads returned nonempty attachment responses.
- ZIP integrity passed. All canonical AI files byte-match the download: one version, 16 source-derived skills, 23 templates, shared rules, example files and local collector tools. 60 entries in the bundle.
- The whole synthetic example reconciles 58 raw = 4 rejected + 4 held + 50 clean. Company fixture labels are 30 GOOD, 10 BAD and 10 MAYBE. Thirty pass to a simulated PAUSED campaign.
- Failure tests cover missing/UNKNOWN inputs, wrong campaign context, missing variables, changed locked copy, unsafe tracking settings, bad/unclear fit, opt-out, missing exact approval, changed thread, unavailable slot, duplicate event after serialised state recovery, expired connection, cost cap and low runway.
- Explicit UTC offsets, equivalent instants in different zones and repeated DST hours are tested locally. This is not a test of an actual calendar integration.
- Refill test excludes previously used contacts. CSV quotes, commas, Unicode and embedded line breaks round-trip.
- Public-page collector tests use a loopback fixture: full, thin, parked, rate-limited, oversized and redirected pages. It keeps TLS validation and does not ship the incomplete source skeleton as working production code. Public-site/Grok/browser fallback compatibility is unverified.
- Local server denies POST, PUT, PATCH, DELETE and OPTIONS. Non-loopback Host is denied. Auth/DB/admin paths and credential-file downloads are absent. CSP limits connections to self and blocks external frames and forms. No production app code or dotenv file is imported.

## Actual browser review
- 65 routes captured at 390 x 844 (phone) and 1440 x 1000 (desktop) in the Codex in-app browser, 130 full-page captures total. DOM checks found zero page-width overflow or clipped paragraph/heading/code text.
- Full-page overview sheets for all routes were visually inspected; key workspace/lesson sections were also inspected at readable size. This is a layout review, not proof that every sentence is understood by a new student.
- Corrected the original logo's large transparent margins using CSS display framing, without editing the brand asset.
- Search for Grok displayed the relevant setup and supporting lessons. Copy instruction byte-matched the displayed prompt and the clipboard was restored. Phone menu opened and closed correctly with Escape.
- The download-event UI check stalled the browser tool. It is NOT counted as passed. HTTP attachment delivery and archive contents passed independently. No application console error was observed after browser recovery.
- After the final budget/reading-order corrections, the five affected pages were rechecked at both sizes with zero measured overflow. Six requested review screenshots retained under screenshots/. The other full-page captures and overview sheets are disposable and are deleted after their review and coverage matrix are recorded.

## Corrections and failures encountered
1. Root `npm ci` fails at the baseline because package.json and package-lock.json disagree. The default host Node is 18.15 while several existing dependencies need Node20+. Production package/lock remain unchanged. The isolated preview has its own package/lock and uses bundled Node24.22.1.
2. An initial Host-header test used fetch, which did not send the intended custom Host. Replaced that transport with node:http; real hostile-Host test passed. This was a test defect, not a claim that the application guard passed before it was exercised.
3. Initial Chrome viewport override did not change actual page dimensions. Those dimensions were not used as phone evidence. Responsive checks were repeated in IAB at verified innerWidth 390 and 1440.
4. Clipboard restoration initially rejected an empty clipboard item list. The corrected routine restores an empty clipboard with writeText and passed. No original clipboard contents were printed.
5. Identifying Grok Bot should have started with official product research. That research is now complete enough for signup/plan/app/skill steps. The earlier unidentified-product blocker is superseded. See OPERATING-SPEC.md.
6. Corrected the buyer lesson handoff so deal economics is read before the selection worksheet.

## Still unverified or requiring review
- Actual Grok account installation, saved-skill availability, secure connections, routines/webhooks and real AI output quality.
- Supported sequencer/plan and its real paused import, identity, thread handling and recovery after an ambiguous external write.
- Controlled internal email/invitation tests. No copy/recipient approval was given and none was sent.
- Actual scheduling availability, booking, sequence-stop side effects and calendar conflicts in the selected tools.
- Real researched campaign case, buyer quotations and company-level triggers. The example distinguishes real public context from synthetic company data. It is not a complete live research approval.
- Human-labelled real-company AI calibration. 50/50 agreement in synthetic deterministic fixtures is not LLM accuracy evidence.
- Matt's teaching review of combined lessons, follow-up policy, qualification thresholds, email rules and new profile/sales-asset instructions.
- Sean/Matt confirmation of CCS-versus-student installer responsibility and real handover reviewer.
- Fresh-student human walkthrough and proof that the actual installed system works before Training handover.
- Existing external Canva/Google/Notion/video assets. They remain in original sources but are not reused as verified downloads. Existing live recordings/access are preserved in production code, not accessed via the preview.
- Current deployed production revision and actual DigitalOcean trigger configuration. No push or remote preview deployment was attempted, so the unverified trigger cannot be activated by this work.
- Browser download-event verification remains open despite passing HTTP/ZIP checks.

## Production isolation evidence
- Local source checkout remains clean on main at 726c5772acb6b8af120f22ae8ddffa7e8c0ac40f. It was already behind current GitHub main by 62 commits; the worktree did not overwrite it.
- Starting GitHub main and end-of-build read both show 49cb29c5ac02eb001e3f3ed5c9c912aaa935ee7a. No externally caused main-source change was observed during the build. This is a source revision, not a proven deployed production SHA.
- Branch is codex/ccs-resources-preview in a separate worktree, with no upstream. No branch push, merge, deployment, DNS, database, secret, original Drive, campaign or workflow mutation.
- Only new branch files under AGENTS.md, content/rebuild/, docs/ccs-rebuild/ and preview/. Existing production source/config/content files are unchanged.
- Loopback preview has no copied credentials and no live accounts. It is private to this computer, not remote hosting or a phone-accessible public URL.

## Source checks for Grok setup
Official documentation read 6 November 2026:
- https://docs.x.ai/grok-bot/get-started
- https://docs.x.ai/grok-bot/bots
- https://docs.x.ai/grok-bot/skills-routines-and-automations
- https://docs.x.ai/grok-bot/approvals-security-and-privacy
- https://docs.x.ai/grok-bot/vault
- https://docs.x.ai/x-subscription/grok-bot

Sean supplied https://resources.closingclientsystem.com/student-setup-support . Both web fetch and Chrome returned failure to resolve. No guessed replacement domain or new support service was created.


## Per-route rendered coverage

All rows below were captured and inspected in full-page overview sheets at both verified sizes. Final affected routes were rechecked after correction. The overview review does not replace a fresh-student walkthrough.

| Preview route | Desktop | Phone | Text/page overflow |
|---|---|---|---|
| /resources/ | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/go-to-market-strategy | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/funnel | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/client-acquisition | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/inbox-pipeline-management | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/sales | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/category/scaling-hiring | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/example | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/start | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/buyers-offer | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/ai-agents | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/sales-materials | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/first-lead-list | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/write-load-emails | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/reply-test | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/launch-review | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/install/handover | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/start | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/daily-replies | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/refill-leads | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/new-copy | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/load-campaign | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/weekly-review | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/troubleshooting | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/training/another-client | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/deal-economics | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/client-selection | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/research | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/offer | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/opportunity | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/pricing | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/positioning | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/go-to-market/proof | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/funnel/website | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/funnel/vsl | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/funnel/calendar | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/funnel/payments | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/funnel/agreement | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/setup | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/list-building | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/scraping | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/qualification | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/variables | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/email-copy | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/deliverability | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/linkedin | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/warm-calling | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/client-acquisition/glossary | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/two-call-process | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/discovery | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/between-calls | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/proposal | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/assets | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/objections | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/sales/value-stacking | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/inbox-pipeline/nurturing | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/scaling-hiring/onboarding | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/scaling-hiring/hiring | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/scaling-hiring/operations | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/resources/templates | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/recordings | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |
| /resources/review-status | 1440 x 1000, reviewed | 390 x 844, reviewed | None detected |

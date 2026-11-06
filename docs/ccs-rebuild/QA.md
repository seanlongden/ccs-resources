# CCS Rebuild QA

Updated 6 November 2026. The actual-app curriculum preview is reviewed and ready for Sean's review. This is not acceptance of a live student installation or completion of every external/technical requirement. Earlier standalone counts are historical and do not verify this app.

## Labels And Source Scope

- Documented: a source or official guide describes it. Execution is not implied.
- Simulated: synthetic inputs replace real services.
- Tested Locally: an executable or browser check passed in the stated preview scope.
- Unverified: account behaviour, source freshness, external evidence or human judgement remains unchecked.
- Not Implemented: the broader B3 pipeline is absent, rather than merely untested.

All 28 Coaching and 13 DWY documents and 56 main repository lessons were read in full, with source IDs and original/current maps retained. Current Drive names were rechecked through the signed-in browser; the connector returned no files. Earlier-read full texts were reused and revisited by topic. Current Drive revision identity is unverified. Existing external videos/templates are not claimed as verified or reproduced historical proof.

## Final Automated Results

Command: CCS_APP_HTTP_TEST=1 node --test preview/tests/*.test.mjs, using bundled Node24.22.1 and authorised loopback access.

31 passed, 0 failed, 0 skipped. 29 concern the current curriculum, local workflow, collector and actual-app harness. Two separate legacy standalone regressions also pass; their old 65-route/75-alias/55-download figures are not actual-app coverage.

Root TypeScript: node node_modules/typescript/bin/tsc --noEmit --incremental false, passed.

- Actual Next HTTP checks: 56 lesson pages, 10 section routes, 131 explicit aliases, 86 linked asset responses byte-for-byte equal to canonical files, four search queries, fixture identity and exact content/API agreement.
- Unknown suffix paths return not-found rather than a fuzzy lesson match. Private files, traversal, symlinks and wrong extensions are denied by asset loading tests.
- ZIP: 100 entries, valid archive, canonical files/versions byte-matched. Sixteen skills, 52 editable templates, 25 example files, shared root files and four local tools. One of the 31 Node test entries runs five Python cache cases. Browser downloaded the same ZIP successfully.
- Source test: all97 source IDs have destinations and current lesson attributions, original planned paths retained. This is not proof every teaching decision is correct.
- Whole example: 58 raw rows = 4 rejected + 4 held + 50 clean. Synthetic 50-company labels = 30 GOOD + 10 BAD + 10 MAYBE. Thirty qualified rows load into a simulated paused campaign. No real import.
- CSV quotes, commas, Unicode and embedded newlines round-trip without row loss.
- Failure cases: missing/UNKNOWN inputs, wrong campaign context, absent variables, changed locked copy, unsafe tracking, bad/unclear fit, opt-outs, missing exact approval, changed threads, unavailable slots, duplicate event after serialised recovery, expired access, cost caps and low runway.
- Timezone checks require UTC offsets and cover equivalent instants and repeated DST hours. Actual calendar behaviour is untested.
- Refills exclude prior contacts; runway divides remaining eligible new contacts by daily new contacts, not total emails.
- Public-HTTPS collector uses verified TLS and bounded time/body/text. Fixture-only HTTP tests cover full, thin, parked, rate-limited, oversized and redirect responses. CSV wrapper rejects malformed/oversized input and refuses overwrite. Its runner is limited to 50 rows per batch. A context-specific Python SQLite cache deduplicates companies, reuses research, resumes after restart, invalidates changed evidence/rules and joins proposed analyses to every contact. Five Python cases pass. Automatic browser fallback and paid-model API client are NOT implemented.
- Five mutating HTTP methods denied; service APIs403; hostile Host denied. No production credentials or live-service calls used.

## Actual Browser Review

69 actual-app routes captured and reviewed in full-page overviews at 1440x1000 and 390x844, 138 original captures. After final wording/navigation corrections, 32 routes were rechecked at both sizes,64 additional captures. Two final collection/status pages were rechecked at both sizes, four further captures, for 206 total. Zero measured page-width or paragraph/heading/code overflow. Overview sheets establish layout review, not that every sentence was read at full size or understood by a student. Key setup, example, copy and navigation sections were also inspected at readable size.

Final functional checks:
- Instruction copy button produced exactly the source prompt. Original clipboard restored without printing its contents.
- Native browser ZIP download succeeded again after the cache extension and matched the final canonical 100-entry pack byte-for-byte. An earlier download-event wait had stalled and was not counted as passed.
- Phone drawer opens, Escape closes and restores its trigger. Selecting a lesson closes it.
- Search for lead runway displays the correct sections. Cross-lesson click opens Training and scrolls its matching heading to about80px below the phone header. An initial failure left that heading below the viewport; a post-mount hash scroll fixed it.
- Breadcrumb, next lesson and the single-lesson Inbox category card navigate correctly. Single-child redirect was removed so the category can actually be revisited.
- Desktop contents rail, prompt wrapping, download links, lesson cards and read-only preview identity reviewed.

Requested final screenshots:
- screenshots/actual-install-desktop.jpg
- screenshots/actual-instructions-phone.jpg
- screenshots/actual-worked-example-desktop.jpg
- screenshots/actual-training-desktop.jpg

Earlier Start Here and standalone screenshot deliverables remain historical, not evidence for the current full rebuild. Disposable captures/contact sheets are removed after recording this route matrix.

## Important Teaching Corrections

- Grok signup/plan choice precedes instruction installation, then agency facts, research/offer and tool connections. Stage prerequisites no longer require a completed offer before the intake that creates it.
- Six Bots and three separate voice files are explained. Canonical skill names match manifest, prompts and downloads.
- The example has complete scoped price, milestone, target, minimum and remedy conditions. Its numbers do not pretend to be actual member results.
- Provider website language is separate from buyer interviews, current triggers and tested demand. No invented student industry proof or copied performance numbers.
- Calendly Free now supports Scheduling API and standard webhooks per 3 November 2026 release. Account scopes, quotas and event-specific permissions still need testing; Standard is optional.
- Separate cold sequence, interested-reply reminders, between-call emails and later reconnects. Matt's policy approval is still required.
- Revenue, first-year customer value, LTV, gross profit and cash timing remain distinct. UNKNOWN never becomes a fabricated margin, GOOD fit or clean health result.

## Failures Encountered And Corrected

1. Baseline npm manifest/lock mismatch and host Node18. Root lock repaired on this branch in the preceding integration; package.json unchanged; bundled Node24 used.
2. Initial Host test transport did not send the intended header. Replaced with node:http and verified real rejection.
3. Chrome viewport override did not change dimensions. Repeated responsive review in IAB with measured 390 and 1440 widths.
4. Phone sidebar squeezed content; mobile drawer/spacing corrected. Desktop rail scrolling ancestor corrected.
5. Clipboard empty-item restoration failed; corrected to restore empty text where appropriate.
6. Grok product identification was delayed; official signup/plan/app/skills/routines documentation now used.
7. Original buyer selection handoff ordered the worksheet before economics; corrected.
8. Self-alias generated by builder removed. Unsafe suffix matching removed.
9. Single-child category auto-redirect prevented a useful index/previous route; removed.
10. Cross-lesson search hash did not scroll after asynchronous rendering; corrected and browser verified.
11. Browser download-event wait stalled; later native file download passed with exact bytes.
12. Final sandbox run denied loopback sockets:24tests passed,5infrastructure errors. Authorised local-network rerun passed all 29 at that point, then all 31 after the cache extension. No test failure was reclassified as success without a rerun.

## Remaining Acceptance And Decisions

These are not passed by local fixtures:
1. Actual Grok private-skill installation/readback, file visibility, six-Bot permissions, routines and real AI output quality.
2. Selected sequencer/account plan, scoped secure connections, actual paused import/readback, real reply/webhook route, thread recovery and reporting.
3. Real scheduling availability, booking, sequence-stop and conflict handling. Controlled test copy/recipients/channels require separate approval before any send or invitation.
4. Real company calibration and current buyer/trigger evidence. Synthetic label agreement is not LLM accuracy.
5. B3 external extensions: automatic browser fallback and paid-model client are not implemented. The local SQLite cache, multi-page collector, proposed-analysis handoff and contact joins are implemented and fixture-tested; real Grok/model execution and scale/usage measurements remain unverified.
6. Matt approves commercial teaching, qualification/follow-up/LinkedIn rules and the new profile/sales-asset instructions. Named installer and handover reviewer need confirmation.
7. Fresh-student human walkthrough and real demonstrated system before Training. No claim of repeatable revenue or profitability.
8. Real production session/subscription/download route integration and live recording access. The local fixture bypass does not test these.
9. Current Drive file revisions, original external video/template usability, deployed production SHA and actual DigitalOcean triggers remain unverified.
10. Supplied support URL fails DNS. Existing CCS channel is the interim help route; no new helpdesk built.

## Production Isolation Evidence

- Separate codex/ccs-resources-preview worktree, no upstream and no push/merge/deployment. Loopback bind 127.0.0.1 only. No public link or mobile-network hosting.
- Protected checkout clean at 726c5772acb6b8af120f22ae8ddffa7e8c0ac40f; remote main unchanged at 49cb29c5ac02eb001e3f3ed5c9c912aaa935ee7a. No remote preview branch. No externally caused main-source change observed.
- Frozen source chunks 0-21 and 100-102, package manifest and deployment configuration unchanged from the starting preview revision. Three old Install objects unchanged. Production databases, auth, original Drive, credentials, domains, workflows and campaigns untouched.
- Harness refuses production mode, wrong branch and local env files, strips inherited service environment values, uses a synthetic identity and denies writes/service routes. CSP blocks external connections, forms and frames. This is a local harness, not a system-wide safety interceptor.
- Actual production deployed SHA/triggers unverified. Nothing was pushed, so those unverified triggers cannot be activated by this work.

## Official Product References Checked

Official sources read 6 November 2026:
- https://docs.x.ai/grok-bot/get-started
- https://docs.x.ai/grok-bot/bots
- https://docs.x.ai/grok-bot/files-and-results
- https://docs.x.ai/grok-bot/skills-routines-and-automations
- https://docs.x.ai/grok-bot/approvals-security-and-privacy
- https://docs.x.ai/grok-bot/vault
- https://docs.x.ai/x-subscription/grok-bot
- https://developer.calendly.com/release-notes/2026/11/3
- https://calendly.com/help/how-to-add-calendly-to-your-website
- https://help.instantly.ai/en/articles/10273259-instantly-plans-overview
- https://help.instantly.ai/en/articles/6261906-webhooks
- https://ai-ark.com/pricing
- https://www.scaledmail.com/pricing
- https://docs.stripe.com/payment-links

Stripe documentation connector lookup failed for missing link_id and no CLI was available. Official public documentation was used instead. No Stripe account accessed or changed.

## Per-Route Rendered Coverage

Every row has both verified sizes. Final affected routes were rechecked. No measured page/text overflow. Two collection/status pages were rechecked once more after adding the cache instructions. Search-anchor interaction fix was subsequently checked on phone and desktop without changing layout/content.

| Actual App Route | Desktop | Phone | Text/Page Overflow |
|---|---|---|---|
| /resources | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/add-instructions | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/agency-profile | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/buyers-offer | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/connect-tools | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/sales-materials | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/first-lead-list | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/write-load-emails | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/reply-test | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/launch-review | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/handover | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/worked-example | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/deal-economics | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/client-selection | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/research | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/offer | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/opportunity | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/pricing | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/positioning | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market/proof | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel/website | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel/vsl | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel/calendar | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel/payments | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel/agreement | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/setup | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/list-building | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/scraping | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/qualification | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/variables | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/email-copy | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/deliverability | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/linkedin | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/warm-calling | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition/glossary | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/two-call-process | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/discovery | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/between-calls | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/proposal | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/assets | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/objections | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales/value-stacking | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/inbox-pipeline/nurturing | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/scaling-hiring/onboarding | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/scaling-hiring/hiring | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/scaling-hiring/operations | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/start | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/daily-replies | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/refill-leads | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/new-copy | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/load-campaign | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/weekly-review | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/troubleshooting | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training/another-client | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/templates | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/review-status | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install/welcome | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-install | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/go-to-market | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/funnel | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/client-acquisition | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/inbox-pipeline | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/sales | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-resources/scaling-hiring | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/ccs-training | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/call-recordings | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/call-recordings/weekly-coaching | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |
| /resources/call-recordings/sales-training | 1440x1000, Reviewed | 390x844, Reviewed | None Detected |

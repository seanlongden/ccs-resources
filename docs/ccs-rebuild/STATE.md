# CCS rebuild state

Updated: 6 November 2026. Status: APPROVED START HERE IN THE ACTUAL APP; NEXT LESSON AWAITS COPY APPROVAL. Full rebuild and live-system acceptance are not complete.

## Scope and authority
Execute the full eleven-part plan using the existing repository and Matt's 41 documents. Preserve CCS Install, CCS Resources and CCS Training. Sean replaced publication with a private preview. Authorised memory: PLAN.md, STATE.md, COVERAGE.md, QA.md and scoped recovery instructions. No global instructions, original Drive material, production branches/settings/domains/databases/credentials/campaigns/workflows may change. Sending/spending/live actions require separate approval.

## Worktree and baselines
- Original checkout: /Users/seanlongden/Projects/ccg-resources, clean main at 726c5772acb6b8af120f22ae8ddffa7e8c0ac40f. Existing credential files were not copied. Local main left untouched.
- Starting and final observed GitHub main: 49cb29c5ac02eb001e3f3ed5c9c912aaa935ee7a. No external main-source change observed during work. Original local main was already 62 commits behind it.
- Separate worktree: /Users/seanlongden/Projects/ccs-resources-preview.
- Branch: codex/ccs-resources-preview, upstream unset. No push, merge or deployment.
- Actual deployed production SHA and DigitalOcean app spec are unverified. Repository documentation says main auto-deploys and no staging exists. Therefore branch pushes were not attempted. Do not equate main source with proven deployed revision.
- Current actual-app review URL: http://127.0.0.1:4327/resources/ccs-install/welcome . The real Next app runs through preview/next-app.mjs with a loopback-only, read-only test identity and service routes blocked. No live credentials were copied and production auth code is unchanged. The older standalone renderer at port 4326 is superseded for reviewing this integration. No remote preview was deployed.

## Current build
- 53 lesson records: nine Install, eight Training, 35 resource/asset lessons and one worked example.
- 16 full source-derived skills, one versioned pack, 23 editable templates, completed teaching files and downloadable ZIP (60 entries).
- 41 Matt documents and 56 existing main lessons individually mapped to present destinations; original content files are unchanged.
- 75 old source-page slugs redirect only in the preview. Six resource categories preserved. Recordings/admin/auth and production database code untouched.
- The approved Start Here page is now in the normal Next content pipeline: content/pages-103.json at ccs-install/welcome, plus the matching page index and navigation entry. It uses the real content API, Sidebar, renderer and LessonView. Other normal lessons are unchanged. Remaining content/rebuild drafts are not yet integrated or approved.
- Root dependencies were installed without lifecycle scripts and the existing manifest/lock mismatch repaired on this branch. No dependency versions were deliberately changed in package.json. TypeScript checking passes. The generated search index is built locally and ignored by Git.
- Actual review found the existing sidebar consumed almost all phone width. Added a mobile drawer and responsive page/card spacing. Removed an inappropriate scrolling ancestor so the original contents rail remains sticky on desktop. Standard sibling navigation is suppressed on Start Here because its approved next lesson is not yet applied; the approved next-step explanation remains visible.

## Phase status
| Plan phase | Current result | Remaining completion condition |
|---|---|---|
| 1 Operating specification | Written, product research and corrections incorporated | Matt/Sean approve proposed responsibility split and operating policies |
| 2 Whole example | Deterministic simulated chain and failure checks pass locally | Actual Grok/sequencer/calendar installation and controlled authorised tests, source-backed real example and Matt review |
| 3 Student material | Full review draft and useful assets prepared | Teaching accuracy and missing real-evidence signoff; human walkthrough |
| 4 Private preview | Working local application, navigation, copy, assets and search | Browser native download-event verification remains unverified after tool stall |
| 5 Student review | 65 routes at desktop/phone reviewed in full-page overviews; key sections full size; local checks pass | Fresh student and CCS human review; real account functionality not implied |
| 6 Handover | Private preview and local review commit prepared | Sean reviews. No merging or publication authorised |

Do not mark any of the remaining conditions complete simply because local fixture tests passed.

## Tests and actual review
23 executable local tests pass. Affected content/HTTP checks re-run after final budget and reading-order correction. 65 HTTP page routes, 75 aliases, 55 attachments, ZIP integrity/byte agreement, search, exact-copy and phone menu checked. All 65 routes captured at both 390x844 and 1440x1000: no measured text/page overflow. Five changed routes rechecked at both sizes. Six requested screenshots retained. QA.md records failures, fixes, coverage matrix and limits. Source-to-destination coverage is not automatic semantic or comprehension proof.

## Sean corrections and decisions
- Latest review: Sean expected updated resources inside the existing CCS resources app. The standalone preview does not satisfy this requirement. Preserve its useful content and assets, but use the actual resources app and its page components for the next private preview. Production remains untouched.
- Capitalise the first letter of every word in page titles and headlines, including short words such as The, And and To. Preserve product names and acronyms.
- Teach a new student literally: explain the complete system they will build, then give the exact links, actions, inputs, AI instructions, visible results, skip routes and next step. Explain unfamiliar files and terms where first needed.
- Use B2B Offers and Direct Response Copy continuously when choosing the sequence, teaching content and wording. Apply concrete outcome, work ownership, work removed, reason for each action and plain-language checks. Preserve factual scope. This is student instruction, not a request for a new offer or an added sales pitch.
- Current sequencing defect found: install/start asks the student to give the AI pack to their AI before Grok Bot setup at install/ai-agents. Resolve prerequisites before any AI-dependent task.
- Sean approved the rewritten Start Here copy in chat, then explicitly authorised applying that page inside the actual app on the preview branch, visually reviewing it, and presenting the next lesson in chat before applying it. That is the current scope. The applied copy preserves the approved wording and adds a working skip-link anchor without changing its visible text.
- Grok is the intended tool. Research public facts rather than ask Matt for basic signup information. Official Grok Bot setup, plan eligibility, app, sign-in, Bot/skill/routine and approval docs are now read and used. Grok signup and plan checking are included in Install. Actual account execution remains unverified.
- Sean supplied https://resources.closingclientsystem.com/student-setup-support . Web fetch/Chrome failed DNS. Record the supplied address, do not guess another or change DNS.
- Support means using the existing CCS contact/channel when stuck. No new helpdesk, support service or support workflow is being built.
- Teach buyer value/economics before the client selection exercise.
- Keep revenue, LTV, profit and cash timing distinct. No guessed margin or implied 30-day sale.

## Preview operating choices, not accepted live terms
Exactly two cold steps; canonical first_name field mapping; one same-thread bump; stop-on-reply; tracking off; paused load; human review. The later DWY/runbook three-reminder timing is the draft proposal, superseding the older two-bump source pending Matt review. No auto-send from silence. Broad research screening and tighter discovery thresholds are explained separately. LinkedIn stays optional/manual. No external write is enabled even if the pack is downloaded.

## Outstanding decisions and checks
1. Actual sequencer/account/plan to support and authorised connection tests.
2. Confirm which setup/preparation work CCS completes versus the student, and who signs off handover.
3. Approve follow-up timing, qualification and commercial-method teaching with Matt.
4. Real case, buyer research and AI qualification calibration; controlled internal test copy/recipients before any sending.
5. Fresh-student walkthrough, support contact text and current live resource access.
6. Actual deployment triggers/deployed revision before any future push or remote preview.
7. Browser native download-event check; the HTTP/ZIP path works but browser tool stalled.

## Failure/correction history
Baseline root npm lock is out of sync; no production dependency repair attempted. Preview uses its own locked renderer and bundled Node24. Initial test Host transport was corrected to node:http. Chrome viewport override was ineffective; responsive review used verified IAB dimensions. Clipboard empty-state restoration corrected. A browser download-event wait stalled and was not counted as passed. These do not permit marking real platform work complete.

## Exact next action
Sean reviews Start Here in the actual-app preview and the next lesson, Add The CCS Instructions To Grok Bot, proposed in chat. Do not apply the next lesson until approved. Its setup draft uses the actual 16-file skill pack, official Bot creation/attachment/private-skill docs, and a read-back check. Grok installation remains untested in an account; file attachment is not proof of saved skill installation. On approval, reconcile the pack README with the corrected order (install instructions before asking for business inputs), implement the next lesson and its downloads/navigation, then inspect desktop/phone and test available handoffs. Preserve the full plan and remaining source coverage. No push, merge, publish, sending, spending or live-account action is authorised.

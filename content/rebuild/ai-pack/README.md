# CCS AI Pack
Version: 1.0.0

This pack gives your AI the CCS method and gives you editable files to check its work. It does not connect accounts or install software by itself. It starts with external writes disabled. Sending, booking, purchases, uploads and routines need the required owner approval and a checked connection.

## Follow This Order
1. Open CCS Install and complete Start Here. Sign in to the Grok Bot app.
2. Extract this ZIP. Open ai-pack. Read README.md.
3. In the Add The CCS Instructions lesson, attach README.md, AGENTS.md, manifest.json and all 16 files from skills. That is 19 files, within the documented 20-file message limit.
4. Ask CCS Chief to save the 16 private skills by their exact names. Check the saved list and read one back. Attaching files is not proof they were saved.
5. Follow Tell The AI About Your Agency. Use templates/profile.md, approved-proof.md and settings.md to create clients/my-agency/. Leave missing facts UNKNOWN.
6. Research buyers and approve the offer before connecting tools or preparing a campaign. Complete offer.md and fit-rules.md in that same folder.
7. Follow Install in order through sales materials, leads, copy, reply practice and CCS review. Save each output in the same client folder.
8. Use Training only after CCS has checked the actual installation and completed your handover.

## Choose The Right Folder
Agency acquisition: clients/my-agency/. These files help you win clients for your agency.
Client delivery: clients/client-name/. Create separate files before running cold email for that client. Do not reuse your own buyer, proof, sender or calendar without checking them.

Grok Bots on one account share a computer and files. Separate folders prevent confusion; they do not create security boundaries. Use an appropriately separate account/workspace when access must be isolated.

## What Is Inside
- skills: 16 full source-derived instructions. Names match manifest.json.
- templates: editable blank working files plus instructions for preparing profiles and sales assets.
- example: one filled teaching case, synthetic lead rows and a local simulation report.
- tools: a bounded three-page public-website collector, CSV parser, command-line runner and Python SQLite company cache. The cache reuses one record per domain, prepares AI review batches and joins proposed results to contacts. It does not call paid models, qualify a contact for sending or bypass blocked websites.

No credentials are included. Keep API keys in the platform's secure connection/vault, never in these files.

## What Has Been Checked
Local tests check file contracts, row reconciliation, exact copy, paused-load simulation, reply/booking failures and the example. The website collector has local HTTP-fixture tests. The company cache has local deduplication, scope, resume, changed-evidence and row-join tests. Actual Grok skill installation, connectors, delivery, routines and real calendar booking remain unverified. Use the app's Check Your System Before You Launch lesson before real outreach.

All example names, fees and results are illustrative. Reserved .example domains cannot be used for a real campaign.

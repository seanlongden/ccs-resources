# Private CCS App Preview

Run from the `codex/ccs-resources-preview` worktree:

```sh
node preview/next-app.mjs
```

Use Node 24 or newer for the TypeScript helper imported by this local harness. Install the root app dependencies first with `npm ci --ignore-scripts`. The root lockfile was repaired in the preceding integration commit to match the existing package manifest. On Sean's machine the bundled Node is `/Users/seanlongden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

Open http://127.0.0.1:4327/resources/ccs-install/welcome . This runs the real Next app, content loader, Sidebar and LessonView. All 11 Install steps, 35 supporting lessons, 8 Training lessons, the worked example and review-status page use the normal content pipeline. Frozen original sources are preserved. The approved welcome is in pages-103.json and the rest is in pages-104.json.

The harness refuses production mode, a different branch and local environment files. It removes inherited service credentials, binds loopback only, provides a synthetic student identity outside the production auth code, denies write methods and denies service APIs. Only content reads, whitelisted downloads and fixture identity pass. Live auth, Stripe and databases are not used. Recordings routes show an explicit notice with empty local lists. This does not test real student authentication or platform connections.

The older `server.mjs` is the earlier standalone draft renderer on port 4326. It is not the actual app preview and should not be used for reviewing this integration.

No push, merge or deployment is authorised. The full curriculum is ready for Sean's private review; live installation acceptance remains open. Read docs/ccs-rebuild/STATE.md, COVERAGE.md and QA.md for real results and limitations.

Regenerate navigation, index, aliases and search after curriculum changes:

```sh
node preview/build-curriculum.mjs
python3 preview/build-pack.py
node scripts/build-search-index.js
```

Restart the harness after JSON content edits because the content loader caches files. Run `CCS_APP_HTTP_TEST=1 node --test preview/tests/*.test.mjs` with the actual app running and loopback access allowed. The Python cache tests use temporary local files and no network. No test uses real sending accounts.

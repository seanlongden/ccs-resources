# Private CCS App Preview

Run from the `codex/ccs-resources-preview` worktree:

```sh
node preview/next-app.mjs
```

Use Node 20 or newer. Install the root app dependencies first with `npm ci --ignore-scripts`. The root lockfile has been repaired on this branch to match the existing package manifest.

Open http://127.0.0.1:4327/resources/ccs-install/welcome . This runs the real Next app, original content loader, Sidebar and LessonView. Only the approved Start Here lesson has been rewritten in the normal content pipeline. Other lessons retain their existing content and still await review.

The harness refuses production mode, a different branch and local environment files. It removes inherited service credentials, binds loopback only, provides a synthetic student identity outside the production auth code, denies write methods and denies all service APIs except read-only content endpoints. Live auth, Stripe, databases and recordings are not used. It does not test real student authentication or platform connections.

The older `server.mjs` is the earlier standalone draft renderer on port 4326. It is not the actual app preview and should not be used for reviewing this integration.

No push, merge or deployment is part of this preview. The proposed next lesson is held in the chat for Sean's approval.

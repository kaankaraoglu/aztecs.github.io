# Decouple Data Fetching from Deploy — Design Spec

**Date:** 2026-05-11  
**Scope:** Run WCL/RIO data fetching on an independent 30-minute schedule, committing updated data to the repo and triggering a deploy only when data changes.

---

## Problem

Data fetching (`fetch-wcl-data.js`, `fetch-rio-data.js`, `fetch-wcl-stats.js`) runs as a `prebuild` npm hook, tightly coupled to every site build. The `deploy.yml` workflow runs hourly and does fetch + build + deploy as a single unit. This means:

- Data freshness is limited to the deploy frequency
- Every deploy re-fetches data even when nothing changed
- You can't update data without rebuilding and redeploying the entire site

---

## Design

### 1. New workflow: `.github/workflows/fetch-data.yml`

A scheduled workflow that runs every 30 minutes and on manual trigger.

**Steps:**
1. Check out `main` with a PAT or `GITHUB_TOKEN` that can trigger downstream workflows
2. Set up Node 22 + `npm ci`
3. Run `npm run fetch-data` (all three fetch scripts) with WCL credentials
4. Check `git diff` on the three data files
5. If any file changed: commit and push to `main`
6. If nothing changed: exit cleanly

**Key details:**
- Uses `concurrency: { group: fetch-data, cancel-in-progress: false }` to prevent overlapping runs
- The push to `main` triggers `deploy.yml` automatically
- Commit message: `chore: update fetched data`
- Commits only the three data files, not the entire tree
- **Token requirement:** The default `GITHUB_TOKEN` cannot trigger downstream workflows (GitHub prevents recursive triggers). The checkout and push must use a Personal Access Token (PAT) stored as a repo secret (e.g., `PAT_TOKEN`) so the push event triggers `deploy.yml`.

### 2. Un-ignore data JSON files

Remove these lines from `.gitignore`:

```
src/data/wcl-progression.json
src/data/wcl-stats.json
src/data/rio-mythicplus.json
```

The files become tracked in the repo. This is required so the fetch workflow can commit them and the build workflow can use them without re-fetching.

### 3. Modify `deploy.yml`

- Remove the `schedule` trigger (`cron: '0 * * * *'`)
- Keep `push: branches: [main]` and `workflow_dispatch` triggers
- Add `SKIP_DATA_FETCH=true` to the build step env so `prebuild` skips fetching
- Remove `WCL_CLIENT_ID` and `WCL_CLIENT_SECRET` from the build step env (no longer needed)

### 4. Modify `package.json` prebuild

Add a wrapper script `scripts/maybe-fetch-data.js` that checks the env var:

```js
if (process.env.SKIP_DATA_FETCH) {
  process.exit(0)
}
import('child_process').then(({ execSync }) => {
  execSync('npm run fetch-data', { stdio: 'inherit' })
})
```

Update `package.json`:

```json
"prebuild": "node scripts/maybe-fetch-data.js"
```

This ensures:
- Local `npm run build` and `npm run dev` (via `predev`) still fetch data
- CI builds skip fetching because data is already committed

Note: `predev` stays as-is — developers always want fresh data locally.

### 5. Modify `refresh-data.yml`

Simplify to dispatch `fetch-data.yml` instead of doing its own full build+deploy:

```yaml
name: Refresh Data
on:
  workflow_dispatch:
concurrency:
  group: fetch-data
  cancel-in-progress: false
jobs:
  trigger-fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'fetch-data.yml',
              ref: 'main'
            })
```

### 6. Update Cloudflare Worker

Change `WORKFLOW_FILE` from `'refresh-data.yml'` to `'fetch-data.yml'` so the manual refresh button triggers the new workflow directly.

---

## Workflow relationships after changes

```
fetch-data.yml (every 30 min, manual)
    │
    ├─ data changed? → commit + push to main → triggers deploy.yml
    │
    └─ no changes? → exit cleanly

deploy.yml (push to main, manual)
    │
    └─ build (skip fetch) + deploy to gh-pages

refresh-data.yml (manual via Cloudflare Worker)
    │
    └─ dispatches fetch-data.yml

ci.yml (PR checks) — unchanged
```

---

## Files to create/modify

| File | Action |
|------|--------|
| `.github/workflows/fetch-data.yml` | Create |
| `scripts/maybe-fetch-data.js` | Create |
| `.github/workflows/deploy.yml` | Modify (remove schedule, skip fetch) |
| `.github/workflows/refresh-data.yml` | Modify (thin dispatch wrapper) |
| `.gitignore` | Modify (un-ignore data JSONs) |
| `package.json` | Modify (conditional prebuild) |
| `workers/refresh/src/index.js` | Modify (change workflow file constant) |
| `CLAUDE.md` | Update data flow documentation |
| GitHub repo secrets | Add `PAT_TOKEN` (PAT with `contents: write` scope) |

---

## Out of scope

- Changing how `useProgression.js` consumes data (still a static import)
- Moving data to external storage (R2/S3)
- Changing the Cloudflare Worker's rate limiting or Turnstile verification

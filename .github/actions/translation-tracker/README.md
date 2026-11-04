# p5.js Translation Tracker

Automatically tracks translation status, creates GitHub issues for outdated translations, generates stub files for missing translations, and powers outdated-translation banners on the website.

## Features

- Detects outdated/missing translations using Git commit comparison
- Creates GitHub issues with diff snippets and action checklists
- Generates translation stub files and opens **one PR per language**
- Shows localized banners on outdated translation pages
- Supports Spanish, Hindi, Korean, and Chinese Simplified

## File Structure

```
.github/actions/translation-tracker/
├── index.js           # Main tracker logic
├── package.json       # Dependencies
├── test-local.js      # Local issue-tracking test
├── test-stubs.js      # Local stub dry-run (writes to stub-preview/)
└── stub-preview/      # Dry-run output (gitignored)

.github/workflows/
├── translation-sync.yml   # Issues + manifests on English changes
└── translation-stubs.yml  # Stub PRs for missing translations across content types
```

## Usage

### Issue tracking (local)

```bash
cd .github/actions/translation-tracker && npm install
node test-local.js
```

### Stub generation (local dry run — recommended)

Writes stubs under `stub-preview/` only (does **not** modify `src/content/`):

```bash
cd .github/actions/translation-tracker && npm install
npm run test:stubs
```

Preview path example:
`stub-preview/src/content/tutorials/es/get-started.mdx`

### Stub generation (open PR on your fork)

```bash
# From repository root — missing files from latest commit only (all languages by default)
  GENERATE_STUBS=true \
  GITHUB_TOKEN=your_token GITHUB_REPOSITORY=youruser/p5.js-website \
  node .github/actions/translation-tracker/index.js

# Single language or full scan (STUB_MAX_FILES applies per language)
  GENERATE_STUBS=true STUB_FULL_SCAN=true STUB_MAX_FILES=10 STUB_LANGUAGES=es,hi \
  GITHUB_TOKEN=your_token GITHUB_REPOSITORY=youruser/p5.js-website \
  node .github/actions/translation-tracker/index.js
```

**Fork:** Settings → Actions → Workflow permissions → **Read and write**.

### GitHub Actions


| Workflow                | Trigger                                    | What it does                            |
| ----------------------- | ------------------------------------------ | --------------------------------------- |
| `translation-sync.yml`  | Push to `examples/en`, `tutorials/en`      | Issues + manifests                      |
| `translation-stubs.yml` | Push to English content under `src/content/*/en`, or manual dispatch | Stub PRs (default: es, hi, ko, zh-Hans) |


Manual stub run: Actions → **Translation Stub Generator** → Run workflow → optional full scan.

## Environment Variables


| Variable             | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `GITHUB_TOKEN`       | API access (issues, PRs)                               |
| `GITHUB_REPOSITORY`  | `owner/repo` (default: `processing/p5.js-website`)     |
| `GENERATE_STUBS`     | `true` = stub mode instead of issue tracking           |
| `STUB_LANGUAGES`     | Comma-separated (default: `es`, `hi`, `ko`, `zh-Hans`) |
| `STUB_CONTENT_TYPES` | Comma-separated (default: `examples`, `tutorials`, `text-detail`, `events`, `libraries` — excludes `reference`) |
| `STUB_FULL_SCAN`     | `true` = all English files, not just latest commit     |
| `STUB_DRY_RUN`       | `true` = write to `stub-preview/`, no PR               |
| `STUB_MAX_FILES`     | Max stubs per language per run (default: `50`)         |
| `STUB_OUTPUT_DIR`    | Custom dry-run output directory                        |


## What stubs contain

For each English **`.mdx`** file with **no** translation yet (`.yaml` / `.yml` sources are skipped for now):

1. Essential English frontmatter (`title`, `description`, etc. — not full API params)
2. `needsTranslation: true`
3. Short HTML comment + placeholder body
4. One PR per language with all stubs grouped (never auto-merged)

Per-file failures are logged and listed in the PR body so one bad source cannot abort the whole language batch.

## Dependencies

- `@octokit/rest`, `js-yaml`
- Node.js built-ins: `fs`, `path`, `child_process`


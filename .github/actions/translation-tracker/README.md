# p5.js Translation Tracker

Automatically tracks translation status for p5.js website content, creates GitHub issues for outdated translations, and shows banners on the website.

## Features

- Detects outdated/missing translations using Git commit comparison
- Tracks all content types: examples, tutorials, reference, text-detail, events, and libraries
- Creates GitHub issues with diff snippets and action checklists
- Shows localized banners on outdated translation pages
- Supports Spanish, Hindi, Korean, and Chinese Simplified

## File Structure

```
.github/actions/translation-tracker/
├── index.js           # Main tracker logic
├── package.json       # Dependencies
├── test-local.js      # Local testing

src/layouts/ExampleLayout.astro              # Banner integration
src/components/OutdatedTranslationBanner/    # Banner component
public/translation-status/examples.json      # Generated status (build artifact)
```

## Usage

### Local Testing
```bash
cd .github/actions/translation-tracker && npm install
node test-local.js
```

### Dry Run (Preview Without Creating Issues)
Scan all files and show what issues would be created, without actually creating them:
```bash
node .github/actions/translation-tracker/index.js --dry-run
```

### Scan All Files (File-based)
```bash
node .github/actions/translation-tracker/index.js
```

### Scan All Files (GitHub API + Create Issues)
```bash
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo node .github/actions/translation-tracker/index.js
```

### GitHub Actions Workflow
The workflow is defined in `.github/workflows/translation-sync.yml` and triggers on pushes to `main` that modify English content files in any of the tracked content types:

- `src/content/examples/en/**`
- `src/content/tutorials/en/**`
- `src/content/reference/en/**`
- `src/content/text-detail/en/**`
- `src/content/events/en/**`
- `src/content/libraries/en/**`

It can also be triggered manually via `workflow_dispatch`.

## Environment Variables

- `GITHUB_TOKEN` - Required for GitHub API and issue creation
- `GITHUB_REPOSITORY` - Format: `owner/repo` (auto-detected in Actions)

## CLI Flags

- `--dry-run` - Preview mode: scans files and logs what issues would be created, but does not create them on GitHub

## What It Does

1. **Scans** English content files for changes
2. **Compares** with translation files using Git commits
3. **Creates** GitHub issues for outdated translations with:
   - Diff snippets showing what changed
   - Links to files and comparisons
   - Action checklist for translators
   - Proper labels (`needs translation`, `lang-es`, etc.)
4. **Generates** manifest file for website banner system
5. **Shows** localized banners on outdated translation pages

## Supported Content Types

| Content Type | Path | Description |
|---|---|---|
| `examples` | `src/content/examples/` | Code examples |
| `tutorials` | `src/content/tutorials/` | Tutorial pages |
| `reference` | `src/content/reference/` | API reference docs |
| `text-detail` | `src/content/text-detail/` | Detailed text content |
| `events` | `src/content/events/` | Event pages |
| `libraries` | `src/content/libraries/` | Library documentation |

## Sample Output

```
📝 Checking 61 English example file(s)

📊 Translation Status Summary:
   🔄 Outdated: 48
   ❌ Missing: 0
   ✅ Up-to-date: 196

🎫 GitHub issues created: 12
   - Issue #36: Spanish, Hindi, Korean, Chinese Simplified need updates
   - URL: https://github.com/owner/repo/issues/36

🗂️ Wrote translation manifest: public/translation-status/examples.json
```

## Dependencies

- `@actions/core`, `@actions/github`, `@octokit/rest`
- Node.js built-ins: `fs`, `path`, `child_process`

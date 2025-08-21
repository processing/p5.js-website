# p5.js Translation Tracker

Automatically tracks translation status for p5.js website examples, creates GitHub issues for outdated translations, and shows banners on the website.

## Features

- Detects outdated/missing translations using Git commit comparison
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

### Scan All Files (File-based)
```bash
node .github/actions/translation-tracker/index.js
```

### Scan All Files (GitHub API + Create Issues)
```bash
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo node .github/actions/translation-tracker/index.js
```

### GitHub Actions Workflow
Create `.github/workflows/translation-sync.yml`:

```yaml
name: Translation Sync Tracker

on:
  push:
    branches: [main, week2]
    paths: ['src/content/examples/en/**']
  workflow_dispatch:

jobs:
  track-translation-changes:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install translation tracker dependencies
        run: cd .github/actions/translation-tracker && npm install
        
      - name: Run translation tracker
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node .github/actions/translation-tracker/index.js
```

## Environment Variables

- `GITHUB_TOKEN` - Required for GitHub API and issue creation
- `GITHUB_REPOSITORY` - Format: `owner/repo` (auto-detected in Actions)

## What It Does

1. **Scans** English example files for changes
2. **Compares** with translation files using Git commits
3. **Creates** GitHub issues for outdated translations with:
   - Diff snippets showing what changed
   - Links to files and comparisons
   - Action checklist for translators
   - Proper labels (`needs translation`, `lang-es`, etc.)
4. **Generates** manifest file for website banner system
5. **Shows** localized banners on outdated translation pages

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
# p5.js Translation Tracker

A comprehensive GitHub Action and command-line tool to track translation status across multiple languages in the p5.js website examples.

## 🚀 Overview

This tool helps maintain translation consistency by:
- **Week 1**: Basic file-based change detection using Git
- **Week 2**: GitHub API integration for accurate commit tracking and automated issue creation
- **Week 3**: Multi-language support with single issues per file and manual scanning capabilities

## 📋 Features

### ✅ Week 1 Features (File-based tracking)
- Git-based change detection for English example files
- File modification time comparison
- Support for all languages: Spanish (es), Hindi (hi), Korean (ko), Chinese Simplified (zh-Hans)
- Local testing capabilities

### ✅ Week 2 Features (GitHub API integration)
- Real commit-based comparison using GitHub API
- Automated GitHub issue creation for outdated translations
- Enhanced issue templates with helpful links and timelines
- Branch detection (auto-detects current branch)
- Backward compatibility with Week 1

### ✅ Week 3 Features (Multi-language & refinement)
- **Single issue per file**: Creates one issue covering all affected languages instead of separate issues per language
- **Enhanced labeling**: Uses "needs translation" base label + specific language labels (e.g., "lang-es", "lang-ko")
- **Manual scanning**: Can scan all English example files to find outdated/missing translations
- **Comprehensive issue format**: Detailed status for each language with links and action checklists
- **Batched language updates**: Groups all translation issues by file for better organization

## 🎯 Supported Languages

- **es**: Spanish (Español)
- **hi**: Hindi (हिन्दी) 
- **ko**: Korean (한국어)
- **zh-Hans**: Chinese Simplified (简体中文)

## 📁 File Structure

```
.github/actions/translation-tracker/
├── index.js           # Main implementation (Week 1 + 2 + 3)
├── package.json       # Dependencies
├── test-local.js      # Testing script with examples
└── README.md          # This documentation
```

## 🛠 Usage

### Basic Usage (Week 1 Mode)

```bash
# Run locally with file-based tracking
node .github/actions/translation-tracker/index.js
```

### GitHub API Mode (Week 2 Mode)

```bash
# Run with GitHub token for commit-based tracking
GITHUB_TOKEN=your_token node .github/actions/translation-tracker/index.js
```

### Manual Scanning (Week 3 Feature)

```bash
# Scan all English example files
GITHUB_TOKEN=token node -e "
const { main } = require('./.github/actions/translation-tracker/index.js');
main(null, { scanAll: true, createIssues: false });
"
```

### Create Issues (Week 2 + 3 Feature)

```bash
# Create GitHub issues for outdated translations
GITHUB_TOKEN=token node -e "
const { main } = require('./.github/actions/translation-tracker/index.js');
main(null, { scanAll: true, createIssues: true });
"
```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
node .github/actions/translation-tracker/test-local.js

# Manual scan test
node .github/actions/translation-tracker/test-local.js manual

# Week 2 features with GitHub API
GITHUB_TOKEN=token node .github/actions/translation-tracker/test-local.js week2

# Create test issues
GITHUB_TOKEN=token node .github/actions/translation-tracker/test-local.js issues
```

## 📝 Issue Format (Week 3)

The tool creates comprehensive GitHub issues with:

### 🔖 Labels
- `needs translation` (base label)
- `help wanted` 
- Language-specific labels: `lang-es`, `lang-hi`, `lang-ko`, `lang-zh-Hans`

### 📄 Issue Content
- **Timeline**: Shows when English and translation files were last updated
- **Outdated Translations**: Lists languages that need updates with commit comparison links
- **Missing Translations**: Lists languages where translation files don't exist
- **Action Checklist**: Step-by-step guide for translators
- **Quick Links**: Direct links to files and comparison views

### Example Issue Structure:
```markdown
## 🌍 Translation Update Needed

**File**: `src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx`
**Branch**: `week2`

### 📅 Timeline
- **Latest English update**: 6/22/2025 by p5js-contributor

### 🔄 Outdated Translations

- **Spanish (Español)**: Last updated 6/9/2025 by spanish-translator
  - [📝 View file](https://github.com/owner/repo/blob/week2/src/content/examples/es/...)
  - [🔍 Compare changes](https://github.com/owner/repo/compare/abc123...def456)

### ✅ Action Checklist

**For translators / contributors:**

- [ ] Review the recent English file changes and the current translations
- [ ] Confirm if translation already reflects the update — close the issue if so  
- [ ] Update the translation files accordingly
- [ ] Maintain structure, code blocks, and formatting
- [ ] Ensure translation is accurate and culturally appropriate
```

## 🔧 Configuration

### Environment Variables

- `GITHUB_TOKEN`: Required for Week 2+ features (API access and issue creation)
- `GITHUB_REPOSITORY`: Auto-detected in GitHub Actions (format: `owner/repo`)
- `GITHUB_EVENT_NAME`: Auto-detected in GitHub Actions
- `GITHUB_REF_NAME`: Auto-detected branch name

### Options Object

```javascript
{
  enableWeek2: boolean,      // Force Week 2 mode
  githubToken: string,       // GitHub token for API access
  createIssues: boolean,     // Whether to create GitHub issues
  scanAll: boolean          // Scan all files instead of just changed files
}
```

## 📊 Output Example

```
🎯 p5.js Translation Tracker - Week 2 Mode
═══════════════════════════════════════════════════════
📅 Event: local
🏠 Working directory: /Users/user/p5.js-website-new
🌍 Tracking languages: es, hi, ko, zh-Hans
🔍 Scan mode: All files

🔍 REPOSITORY STRUCTURE ANALYSIS
═══════════════════════════════════
📁 Examples path: src/content/examples
🌐 Available languages: en, es, hi, ko, zh-Hans
  en: 61 example files across 15 categories
  es: 61 example files across 15 categories
  hi: 61 example files across 15 categories
  ko: 61 example files across 15 categories
  zh-Hans: 61 example files across 15 categories

📝 Checking translations for: src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx
  🔄 es: Needs update
  ✅ hi: Up to date
  🔄 ko: Needs update
  🔄 zh-Hans: Needs update

📝 Creating GitHub issue for src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx...
  ✅ Created issue #123: Update translations for description.mdx

📊 TRANSLATION STATUS SUMMARY (Week 2)
═══════════════════════════════════════
🆕 Missing translations: 0
🔄 Outdated translations: 3
✅ Up-to-date translations: 1
🎫 Issues created: 1
  - Issue #123: description.mdx (Affected: es, ko, zh-Hans)
```

## 🚀 GitHub Actions Integration

Create `.github/workflows/translation-tracker.yml`:

```yaml
name: Translation Tracker

on:
  push:
    paths:
      - 'src/content/examples/en/**/*.mdx'
  schedule:
    - cron: '0 0 * * 1'  # Weekly scan

jobs:
  track-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd .github/actions/translation-tracker && npm install
      
      - name: Track translation status
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node .github/actions/translation-tracker/index.js
```

## 🔄 Migration from Previous Versions

- **Week 1 → Week 2**: Fully backward compatible, automatically detects GitHub token
- **Week 2 → Week 3**: Automatically creates single issues instead of multiple issues per language
- **Legacy Mode**: Will continue working in Week 1 mode if no GitHub token is provided

## 💡 Key Improvements in Week 3

1. **Single Issue Per File**: Instead of creating separate issues for each language, creates one issue that covers all affected languages for a specific file
2. **Better Organization**: Issues are grouped by file rather than scattered by language
3. **Enhanced Labels**: Uses "needs translation" + specific language labels for better filtering
4. **Manual Scanning**: Ability to scan all files on demand rather than just changed files
5. **Improved Issue Format**: More detailed and actionable issue templates

## 🤝 Contributing

The translation tracker is modular and extensible:

- Add new languages by updating `SUPPORTED_LANGUAGES` array
- Modify issue templates in `formatMultiLanguageIssueBody()` method
- Extend file scanning logic in `getAllEnglishExampleFiles()` function
- Add new detection modes by extending the `main()` function options

## 📚 Dependencies

- `@actions/core`: GitHub Actions integration
- `@actions/github`: GitHub API wrapper
- `@octokit/rest`: GitHub REST API client
- Node.js built-in modules: `fs`, `path`, `child_process` 
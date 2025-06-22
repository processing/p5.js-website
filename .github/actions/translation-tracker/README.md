# p5.js Translation Tracker

A GitHub Action to track translation status for p5.js examples and documentation.

## Files Structure

- `index.js` - Main implementation (Week 1 + Week 2 functionality)
- `package.json` - Dependencies and metadata
- `test-local.js` - Local testing script
- `node_modules/` - Dependencies (auto-generated)
- `package-lock.json` - Dependency lock file (auto-generated)

## Features

### Week 1 (File-based tracking)
- Track changed English example files using git
- Compare file modification times
- Support local testing with test files
- Comprehensive repository structure analysis

### Week 2 (GitHub API integration)
- Real commit-based comparison using GitHub API
- Automated GitHub issue creation for outdated translations
- Enhanced issue templates with helpful links
- Backward compatibility with Week 1

## Usage

### Local Testing (Week 1 mode)
```bash
node test-local.js
```

### Production with GitHub API (Week 2 mode)
```bash
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo node index.js
```

## Supported Languages
- Spanish (es)
- Hindi (hi) 
- Korean (ko)
- Chinese Simplified (zh-Hans)

## Dependencies
- `@actions/core` - GitHub Actions toolkit
- `@actions/github` - GitHub Actions GitHub integration
- `@octokit/rest` - GitHub API client for Week 2 features 
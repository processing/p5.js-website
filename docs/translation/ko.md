# Korean (한국어) Translation Guide

This document contains translation guidelines for Korean contributors working on the p5.js website.

For general localization architecture, see [localization.md](../localization.md).

## Glossary

A Korean terminology table is being developed in [issue #1323](https://github.com/processing/p5.js-website/issues/1323).

## Style Points

### Line Spacing

Korean characters do not have descenders like Latin letters do, which causes fonts to allocate less vertical space by default. This makes Korean text appear more compressed than intended. A CSS rule was added in [PR #1392](https://github.com/processing/p5.js-website/pull/1392) to increase line spacing for Korean content:

```css
html[lang="ko"] .rendered-markdown {
  line-height: 1.7;
  word-break: keep-all;
}
```
`word-break: keep-all` prevents Korean words from breaking mid-word at line endings which can look awkward in Korean text.

## Additional Resources

The p5.js repository contains a Korean translation guide with tips, resources and terminology decisions from the FES Korean translation project: [Korean Translation Resources](https://github.com/processing/p5.js/tree/main/translations/ko) 
# Hindi (हिन्दी) Translation Guide

This document contains translation guidelines for Hindi contributors working on the p5.js website.

For general localization architecture, see [localization.md](../localization.md).

## Glossary

For the Hindi glossary of standardized technical and p5.js-specific terms, see [localization_hi.md](../localization_hi.md).

## Technical Exceptions

### Punctuation Handling

Hindi uses `।` (danda) and `॥` (double danda) as sentence ending punctuation instead of the Latin full stop `.`

The regex in `src/components/GridItem/Reference.astro` was updated in PR #1156 to include these characters. Without them the regex only recognised `.` and `。` as sentence endings, causing Hindi reference pages to display the entire description instead of just the first line.

See [PR #1156](https://github.com/processing/p5.js-website/pull/1156)
and [issue #1154](https://github.com/processing/p5.js-website/issues/1154)
for full details.

## Additional Resources

The p5.js repository contains the Hindi FES error message translations which may be useful for terminology consistency: [Hindi FES Translations](https://github.com/processing/p5.js/tree/main/translations/hi)
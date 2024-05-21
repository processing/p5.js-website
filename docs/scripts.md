# Content Scripts

This repo includes a few scripts to pull content from external sources, primarily the [p5.js repo](https://github.com/processing/p5.js).

They are all runnable via npm scripts.

## After a p5.js release

To update the content on the p5.js website following a new release of p5.js, you should run all of these commands to pull in the latest content. **Be sure to run the search indices script last as it depends on the results of the other scripts to be accurate.**

## Contributor Docs Build Script

`npm run build:contributor-docs` copies the contributor docs from the p5.js repo and places them into the [contributor docs content collection](/src/content/contributor-docs).

## Reference Build Script

`npm run build:reference` parses the inline documentation in the p5.js source code (the JSDoc comments) and generates the pages in the [reference collection](/src/content/reference). Because the directly inline documentation for p5.js is only in English, this script will only update the English translation of the reference.

## Contributors List Build Script

`npm run build:contribtuors` parses the list of contributors from the all contributors [config file](https://github.com/processing/p5.js/blob/main/.all-contributorsrc) in the p5.js repo and adds entries in the [people collection](src/content/people/en) for anyone who is missing. These are used to render the list of contributors on the [People page](https://p5js.org/people/). This script will **not** remove or update existing entries, that must be done manually.

## Search Indices Build Script

`npm run build:search` generates metadata about the content of the website so the search functionality can show relevant results. This script should usually be run after any of the above scripts are run.

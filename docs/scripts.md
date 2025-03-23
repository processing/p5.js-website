# Content Scripts

This repo includes a few scripts to pull content from external sources, primarily the [p5.js repo](https://github.com/processing/p5.js).

They are all runnable via npm scripts.

## Testing the docs of your fork

If you are contributing a change to the main p5.js repo that affects documentation, you will want to preview how your changes will look on the website. To do so, make sure you have committed your changes to a branch of your fork of p5.js.

Then, in the p5.js-website repo, run the following command, using the URL of your fork  of p5 before the `#`, and the name of your branch after the `#`:

```sh
npm run custom:dev https://github.com/yourUsername/p5.js.git#yourBranch
```

This will build the reference from your branch and start a development preview of the website. A URL will be logged in the console that you can go to in your browser to test out your changes.

When you're done, you can run this command to reset your changes:
```sh
npm run custom:cleanup
```

## After a p5.js release

To update the content on the p5.js website following a new release of p5.js, you should run all of these commands to pull in the latest content. **Be sure to run the search indices script last as it depends on the results of the other scripts to be accurate.**

## Contributor Docs Build Script

`npm run build:contributor-docs` copies the contributor docs from the p5.js repo and places them into the [contributor docs content collection](/src/content/contributor-docs).

## Reference Build Script

`npm run build:reference` parses the inline documentation in the p5.js source code (the JSDoc comments) and generates the pages in the [reference collection](/src/content/reference). Because the directly inline documentation for p5.js is only in English, this script will only update the English translation of the reference.

## Contributors List Build Script

`npm run build:contributors` parses the list of contributors from the all contributors [config file](https://github.com/processing/p5.js/blob/main/.all-contributorsrc) in the p5.js repo and adds entries in the [people collection](src/content/people/en) for anyone who is missing. These are used to render the list of contributors on the [People page](https://p5js.org/people/). This script will **not** remove or update existing entries, that must be done manually.

## Update p5 version Build Script

`npm run build:p5-version` reads the latest version of the p5.js library (for example, "2.19.3") and updates the website config to use that version of the library for embeds and download links across the site.

## Search Indices Build Script

`npm run build:search` generates metadata about the content of the website so the search functionality can show relevant results. This script should usually be run after any of the above scripts are run.

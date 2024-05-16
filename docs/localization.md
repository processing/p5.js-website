# Localization Architecture

An important feature of the p5.js website is support multiple languages (four and counting!). This requires the website to build and serve every page in each of the supported languages.

Our website framework Astro has localization support, but it doesn't cover our full set of needs so the localization tooling in this repo is largely [hand rolled](https://www.quora.com/Computer-Science-Where-did-the-phrase-Roll-your-own-come-from-and-why-is-it-used-in-CS).

## Supported Languages and Language Codes

The languages that will be built and included in the language dropdown menu are defined in [`/src/i18n/const.ts`](/src/i18n/const.ts) The language codes used in that list define both the routes for localized content (for example: the "es" in https://p5js.org/es/examples) as well as the expected language folders in each content collection (every folder in [`/src/content`](/src/content)). These generally follow [these language codes](https://en.wikipedia.org/wiki/ISO_639-1).

## Translation Authoring Locations

Almost all strings and text are stored within content collections in src/content.

Every content collection in `src/content` is divided into language-specific folders. The pages in a collection must have the same name in each language folder.

Each file within these collection folders corresponds to a real page on the rendered website.

The ["ui" content collection](src/content/ui/) is a little different than the others. It contains yaml files that cover strings that are used across different pages for things like the navigation bar.

## Routes and Layouts

Astro uses a file-based approach to generating routes. The filepath of each file in `src/pages` becomes the url of the page it renders. Because we need to support a url scheme where English translations of pages are served at a URL with no locale prefix (for example, the English version of the tutorials page is at https://p5.js/tutorials _not_ https://p5.js/en/tutorials), there are 2 sets of routing files and folders: one in `src/pages` and another `src/pages/[locale]`. The `[locale]` set are needed to build and serve the non-English pages (whose URLs are also prefixed by the language codes).

Taking the tutorials page as an example:

- `src/pages/tutorials` is the route for the English tutorials page
- `src/pages/[locale]/tutorials` is the route for all other translations of the tutorials page

Both of these routes use the [TutorialsLayout](/src/layouts/TutorialsLayout.astro) to render the page by passing in the content in the correct language.

The main difference between these two routing files is how they retrieve the correct translation. The English version retreives the English version of the content. The other translations retrieve their version of the content and then fill in any gaps with English versions. See `getCollectionInLocaleWithFallbacks()` for how this works.

Because of this subtle duplication, we try to keep the files in `src/pages/` as short as possible and move rendering logic into the [layout files](/src/layouts/).

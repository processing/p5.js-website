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

## Using translations

When you are editing an existing page or adding a new one, there are two ways to use individual translated strings from the ["ui" content collection](/src/content/ui/). It depends on what kind of file you are editing:

### Astro files (`.astro`)

In .astro files you can use `getCurrentLocale()` and `getUiTranslator()` like so:

```astro
---
import { getCurrentLocale, getUiTranslator } from "@i18n/utils";

const currentLocale = getCurrentLocale(Astro.url.pathname);
const t = await getUiTranslator(currentLocale);

const introText = t("New intro paragraph");
---

<p>{introText}</p>
```

`getCurrentLocale()` extracts the current locale code from the page's URL. Passing this to `getUiTranslator()` tells it which language to return translations for. Whenever a translation is missing for the given language, it will return the string in English (the fallback language).

The returned translator function (`t`) accepts a key or list of keys to know which translation string to return. Check [the English translation file to see the most complete list of what's already available](/src/content/ui/en.yaml). The keys you pass to the translator function are used to lookup a string in that file (or the equivalent of it in the current language). If the `en.yaml` file has the following content:

```yaml
Forum: Forum
Sketches: Sketches
Libraries: Libraries
People: People
New intro paragraph: Welcome to this new page we just added!
sectionTitles:
  main: An intro to squares
```

Then `t("New intro paragraph")` will return "Welcome to this new page we just added!" and `t("sectionTitles", main)` will return "An intro to squares".

### Preact files (`.jsx`, `.tsx`)

Preact files cannot access the current url directly with `Astro.url.pathname`, so we have to take a different approach: we pass in a translation object as a prop. Every Preact component in this project is rendered from an Astro layout or component file, so we can rely on it to get the correct current language.

In our astro file, we use our old friend `getCurrentLocale()` and then pass the result to `getUiTranslationWithFallback()` to get an object of translations. And pass it to the `HelloButton` component.

```astro
---
import { getCurrentLocale, getUiTranslationWithFallback } from "@i18n/utils";
import { HelloButton } from "@components/HellowButton/index.jsx"

const currentLocale = getCurrentLocale(Astro.url.pathname);
const uiTranslations = await getUiTranslationWithFallback(currentLocale);
---

<HelloButton uiTranslations={uiTranslations} />

```

And then in the HelloButton Preact component, we acess the translations using object keys:

```jsx
export const HelloButton = (props) => {
  const { uiTranslations } = props;
  return <button>{uiTranslations["hello"]}</button>;
};
```

Essentially, the arguments you would pass to `t` in the first example for astro files are the same you would pass as keys to the `uiTranslations` object. If its a nested key, that looks like:

```jsx
uiTranslations["sectionTitles"]["main"];
```

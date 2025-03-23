# Technical Overview

## Getting Started with Development

### Setup

1. Make sure you have [node and npm installed on your machine](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).
2. Clone this repo by typing git clone https://github.com/processing/p5.js-website/ in your terminal. (You can also use [GitHub Desktop](https://desktop.github.com/)).
3. Then install the project's dependencies with:

```shellsession
npm install
```

### Running

Running this will start up a local dev server and print out the address in your terminal (for example: http://localhost:4321/). Open that page in your browser to see the website.

```shellsession
npm run dev
```

## File Organization

The website code is divided into a few main folders:

- `src/content/` this is where almost all content authoring happens in the repo. These files contain the content that is used to generate the website.
- `src/components/` holds UI elements that are rendered on different pages of the website. Things like basic buttons, as well as more specialized things like the top navigation menus are here.
- `src/layouts/` this contains the basic visual structure of each page. If you are looking to edit a specific page of the website, finding the layout for it in this folder is a great place to start.
- `src/pages/` these files are primarily used to create the routes (the different URLs) for the pages of the website and pull content from `src/content/`. Note that every route basically exists twice: once in `src/pages/` and again in `src/[locale]/pages/` to support localized urls. Read more about this in [./localization-architecture.md]
- `src/api/` holds the logic for fetching information from the OpenProcessing API, where all the gallery sketches for this website are stored
- `src/i18n/` holds the utilities and configuration for working with translations
- `src/scripts/` contains utility scripts that update the files in `src/content/` with changes in the p5.js repo
- `styles/` contains globally applied css styles for the website
- `test/` contains a set of unit tests that cover some important utility functions and key components

## Making Changes

As you make changes to the code on the site, the page you see rendered in the browser from `npm run dev` will update automatically. However, you may need to refresh to see some styling changes reflected.

You can check your work with the following commands. These will run type checking on typescript files and check for common mistakes in javascript files.

```shellsession
npm run lint
npm run check
```

## Running Tests

To run the suite of unit tests, use:

```shellsession
npm run test
```

## Building the site

We are using the [Astro framework](https://astro.build) as a [static site generator](https://docs.astro.build/en/basics/rendering-modes/#pre-rendered), which means that the build process renders every single page of the website as HTML (and JavaScript and CSS) and then serves them using a simple server. These are then uploaded to [GitHub Pages](https://pages.github.com/). This all happens automatically with GitHub Actions when code is merged to the `main` branch in this repo.

You can try building the site locally with

```shellsession
npm run build
```

And then view it locally with

```shellsession
npm run preview
```

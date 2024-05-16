# Technical Overview

## Development

### Setup

First, make sure you have [node and npm installed on your machine](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

Then, all you have to run is:

```shellsession
npm install
```

### Running

Running this will start up a local dev server and print out the address in your terminal (for example: http://localhost:4321/). Open that page in your browser to see the website.

```shellsession
npm run dev
```

### Making Changes

As you make changes to the code on the site, the page you see rendered in the browser from `npm run dev` will update automatically. However, you may need to refresh to see some styling changes reflected.

You can check your work with the following commands. These will run type checking on typescript files and check for common mistakes in javascript files.

```shellsession
npm run lint
npm run check
```

## File Organization

The website code is divided into a few main folders.

- `src/content/` this is where almost all content authoring happens in the repo. These files contain the content that is used to generate the website.
- `src/components/` holds UI elements that are rendered on different pages of the website. Things like basic buttons, as well as more specialized things like the top navigation menus are here.
- `src/layouts/` this contains the basic visual structure of each page. If you are looking to edit a specific page of the website, finding the layout for it in this folder is a great place to start.
- `src/pages/` these files are primarily used to create the routes (the different URLs) for the pages of the website and pull content from `src/content/`. Note that every route basically exists twice: once in `src/pages/` and again in `src/[locale]/pages/` to support localized urls. Read more about this in [./localization-architecture.md]
- `src/scripts/` contains utility scripts that update the files in `src/content/` with changes in the p5.js repo
- `styles/` contains globally applied css styles for the website
- `test/` contains a set of unit tests that cover some important utility functions and key components

## Run Tests

To run the suite of unit tests, use:

```shellsession
npm run test
```

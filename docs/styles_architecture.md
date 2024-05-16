# Styling (CSS) Architecture

## Methods

There are a few ways you can write CSS in this project:

### 1. Use [Tailwind](https://tailwindcss.com/) css classes directly within layouts and components

This is often the fastest way to add custom styles if you are familair with [Tailwind](https://tailwindcss.com/). See a good example in `/src/p5/p5.js-website/src/components/Footer/index.astro`.

### 2. Write styles in the [SCSS](https://sass-lang.com/) files in `/styles` and use those classes in layouts and components

The styles folder is primarily meant for foundational styles that are used across pages and components. The majority of it is in `/styles/global.scss`.

### 3. Write a `styles.module.scss` file for a specific component and import it into that component

This can be useful for situations where the styling you need for a particular area is very complex and hard to distill in simple Tailwind classes. See a good example of this approach in `/src/components/Dropdown`.

#### 4. Write css in a style tag within an `.astro` file

This can be a good approach when you need a few custom styles for a single a layout or component but adding an extra SCSS feels like overkill. See an example in `/src/layouts/AboutLayout.astro`

## Useful Global Styles

These global classes may do exactly what you need:

### Grids

Both of these are useful for laying out a series of items in a responsive grid with the right spacing.

- .content-grid
- .content-grid-simple

### Sections

Page layouts rely on having content within one or more `<section>`'s (or `.section`'s) to have proper spacing.

### Markdown

The `.rendered-markdown` class is intended to wrap areas where we render markdown content from a content collection. See `/src/layouts/TextDetailLayout.astro` for a simple example.

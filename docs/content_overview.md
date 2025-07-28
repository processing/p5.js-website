# Which content is where?

## Reference

- Stored in `/src/content/reference/`
- English version is pulled in from p5.js repo via [scripts](./scripts.md)
- Other translations are stored directly in this repo under the corresponding language folder in `/src/content/reference/`

## Examples

- Stored in `/src/content/examples/`
- All translations are stored and edited directly in this repo under the corresponding language folder in `/src/content/examples/`

All original examples (created new for p5.js) since 2024 are collectively attributed to p5.js Contributors under the CC-BY-NC-SA 4.0 license. However, examples that build on prior work (under a compatible license) can be attributed in more detail, to make sure that authorship is clear in citation, and code history is available to viewers.

To add attribution, you can use the following block in the headers, listing in chronological order all arrtibutions. Below is the example from `examples/animation-and-variables-conditions/`:

```yaml
remix:
  - description: Inspired by

    attribution:
      - name: Prof. WM Harris
        URL: https://people.rit.edu/wmhics/

    code:
      - URL: https://github.com/processing/p5.js-website-legacy/blob/main/src/data/examples/en/04_Control/05_Logical_Operators_2.js
      - label: pre-2023 code

  - description: Revised by

    attribution:    
      - name: Caleb Foss
        URL: https://github.com/calebfoss
 
    code:
      - URL: https://github.com/processing/p5.js-example/tree/main/examples/02_Animation_And_Variables/03_Conditions
        label: 2023 revision code

  - collectivelyAttributedSince: 2024
```

This will result in a block that lists, in order, the initial inspiration; any revision or other remix; and the collective attribution statement that begins in 2024: "From 2024 onwards, edited and maintained by p5.js Contributors and the Processing Foundation. Licensed under CC BY-NC-SA 4.0."

A remix can be many things ([here is an example analysis of sketch remixing (PDF)](https://dl.acm.org/doi/pdf/10.1145/3563657.3595969)); the `description` will be by default "Remixed by", so a more specific description is recommended.

If the `collectivelyAttributedSince` information is missing, then no year will be included, but the collective attribution statement will still show: "Edited and maintained by p5.js Contributors and the Processing Foundation. Licensed under CC BY-NC-SA 4.0." You'll see this in examples that were part of a major revision project with specific attribution, but have collective authorship before and after.

Each item in the remix history must have an at least one person listed in the attribution section. When multiple people are listed, their names will be shown in that order. For people, URLs are optional but recommended.

---

## Tutorials

- Stored in `/src/content/tutorials/`
- All translations are stored and edited directly in this repo under the corresponding language folder in `/src/content/tutorials/`

## Contributor docs

- Stored in `/src/content/contributor-docs/`
- All translations are pulled in from p5.js repo via [scripts](./scripts.md)

## Libraries

- Stored in `/src/content/libraries/en/`
- There are no translations for these entries
- See [Contributing Libraries](./contributing_libraries.md) for more info

## People

- Stored in `/src/content/people/en/`
- There are no translations for these entries
- New entries are pulled in from p5.js repo via [scripts](./scripts.md), existing ones are edited directly in this repository

## Events

- Stored in `/src/content/events/`
- All translations are stored and edited directly in this repo under the corresponding language folder

## Homepage

- Stored in `/src/content/homepage/`
- All translations are stored and edited in their respective language folder there

## About page

- All translations for the first half of the page are stored in `/src/content/text-detail/[lang]/about.mdx` (where `[lang]` is the appropriate language code)
- The second half of the page (from the "People" section to the bottom) is in `/src/layouts/AboutLayout.astro`

## Simple static pages (like Privacy Policy and Code of Conduct)

- Stored in `/src/content/text-detail/`
- All translations are stored and edited in their respective language folder there
- This includes simple general pages like Contact, Privacy Policy, Download, etc.

## Community Sketches

- Stored in a curation on [OpenProcessing](https://openprocessing.org)
- This is only the gallery of community sketches. It doesn't include sketches that are embedded within tutorials, examples, or the reference.
- See [Community Sketches](./community_sketches.md) for more info

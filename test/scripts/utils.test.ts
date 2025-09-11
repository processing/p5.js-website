import { expect, test } from "vitest";
import { rewriteRelativeMdLinks } from "../../src/scripts/utils";

test("rewriteRelativeMdLinks", () => {
  expect(
    rewriteRelativeMdLinks(`
  # Title
  
  You can find more examples [here](https://p5xjs.org/examples.html) and
  in the [guide](./the-guide.md).
  
  ![image](./assets/image.jpg)
  
  ## Related Docs
  - See [Access](./access.md).
  - [Other](./folder/document.md)
  - [Other](folder/document.md)
  - [lol](./some-where-else/wow/)
  - [absolute](/wow/)
  - [no trailing slash](../test)
  - [external](https://p5js.org/)
  `),
  ).toEqual(`
  # Title
  
  You can find more examples [here](https://p5xjs.org/examples.html) and
  in the [guide](../the-guide/).
  
  ![image](./assets/image.jpg)
  
  ## Related Docs
  - See [Access](../access/).
  - [Other](../folder/document/)
  - [Other](../folder/document/)
  - [lol](../some-where-else/wow/)
  - [absolute](/wow/)
  - [no trailing slash](../test/)
  - [external](https://p5js.org/)
  `);
});

test("rewriteRelativeMdLinks with reference links", () => {
  expect(
    rewriteRelativeMdLinks(`
# Documentation

See [our guide][guide] and [access statement][access].

You can also check [external link][external].

[guide]: ./contributing_guide.md
[access]: ./access.md#intro
[external]: https://p5js.org/
    `),
  ).toEqual(`
# Documentation

See [our guide][guide] and [access statement][access].

You can also check [external link][external].

[guide]: ../contributing_guide/
[access]: ../access/#intro
[external]: https://p5js.org/
    `);
});

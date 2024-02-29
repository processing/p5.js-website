import { expect, test } from "vitest";
import { rewritePageLinks } from "../../src/scripts/utils";

const markdownString = `
# Title

You can find more examples [here](https://p5xjs.org/examples.html) and
in the [guide](./the-guide.md).

![image](./assets/image.jpg)

## Related Docs
- See [Access](./access.md).
- [Other](./folder/document.md)
- [lol](./some-where-else/wow/)
`;

const processedString = `
# Title

You can find more examples [here](https://p5xjs.org/examples.html) and
in the [guide](./the-guide/).

![image](./assets/image.jpg)

## Related Docs
- See [Access](./access/).
- [Other](./folder/document/)
- [lol](./some-where-else/wow/)
`;

test("rewritePageLinks", () => {
  expect(rewritePageLinks(markdownString)).toEqual(processedString);
});

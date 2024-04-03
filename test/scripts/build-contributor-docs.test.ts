import { expect, test } from "vitest";
import {
  convertMarkdownCommentsToMDX,
  rewriteRelativeImageLinks,
} from "../../src/scripts/builders/contribute";

test("rewriteRelativeImageLinks", () => {
  expect(
    rewriteRelativeImageLinks(
      `
  # Title
  
  You can find more examples [here](https://p5xjs.org/examples.html) and
  in the [guide](./the-guide.md) or read about [lol](./some-where-else/wow/).
  
  ![alt-text](./images/image.jpg)
  ![alt-text](/images/image.png)
  ![alt-text](images/image.gif)

  ![alt-text](https://mypage.com/cool-image.jpg)
  ![alt-text](http://www.mypage.com/cool-image.jpg)
  ![Screenshot of the main page of repository. A button, labeled with a fork icon and "Fork 59.3k," is outlined in dark orange.](fork.png)
  `,
      "/public/docs",
    ),
  ).toEqual(`
  # Title
  
  You can find more examples [here](https://p5xjs.org/examples.html) and
  in the [guide](./the-guide.md) or read about [lol](./some-where-else/wow/).
  
  ![alt-text](/public/docs/image.jpg)
  ![alt-text](/public/docs/image.png)
  ![alt-text](/public/docs/image.gif)

  ![alt-text](https://mypage.com/cool-image.jpg)
  ![alt-text](http://www.mypage.com/cool-image.jpg)
  ![Screenshot of the main page of repository. A button, labeled with a fork icon and "Fork 59.3k," is outlined in dark orange.](/public/docs/fork.png)
  `);
});

test("convertMarkdownCommentsToMDX", () => {
  expect(
    convertMarkdownCommentsToMDX(`
  <!-- What our commitment to access means for contributors and users of the library. -->

  # Our Focus on Access

  At the [2019 Contributors Conference](https://p5js.org/community/contributors-conference-2019.html), p5.js made the commitment to only add new features that increase access (inclusion and accessibility). We will not accept feature requests that don't support these efforts. We commit to the work of acknowledging, dismantling, and preventing barriers. This means considering intersecting[^1] experiences of diversity that can impact access and participation. These include alignments of gender, race, ethnicity, sexuality, language, location, et cetera. We center the needs of marginalized groups over the continued comfort of those privileged within the p5.js community. We are collectively exploring the meaning of access. We are learning how to practice and teach access. We choose to think of access through expansive, intersectional, and coalitionary frameworks. This commitment is part of the core values of p5.js outlined in our [Community Statement](https://p5js.org/community/).
  `),
  ).toEqual(`
  {/* What our commitment to access means for contributors and users of the library. */}

  # Our Focus on Access

  At the [2019 Contributors Conference](https://p5js.org/community/contributors-conference-2019.html), p5.js made the commitment to only add new features that increase access (inclusion and accessibility). We will not accept feature requests that don't support these efforts. We commit to the work of acknowledging, dismantling, and preventing barriers. This means considering intersecting[^1] experiences of diversity that can impact access and participation. These include alignments of gender, race, ethnicity, sexuality, language, location, et cetera. We center the needs of marginalized groups over the continued comfort of those privileged within the p5.js community. We are collectively exploring the meaning of access. We are learning how to practice and teach access. We choose to think of access through expansive, intersectional, and coalitionary frameworks. This commitment is part of the core values of p5.js outlined in our [Community Statement](https://p5js.org/community/).
  `);
});

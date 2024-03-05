import { expect, test } from "vitest";
import { rewriteRelativeImageLinks } from "../../src/scripts/build-contribute";

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

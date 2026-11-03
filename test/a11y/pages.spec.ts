import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pagesToScan = [
  { name: "home", path: "/" },
  { name: "about", path: "/about/" },
  { name: "community", path: "/community/" },
  { name: "contribute", path: "/contribute/" },
  { name: "education resources", path: "/education-resources/" },
  { name: "events", path: "/events/" },
  { name: "libraries", path: "/libraries/" },
  { name: "people", path: "/people/" },
  { name: "sketches", path: "/sketches/" },
  { name: "search", path: "/search/" },
  { name: "tutorials index", path: "/tutorials/" },
  { name: "tutorial", path: "/tutorials/get-started/" },
  { name: "examples index", path: "/examples/" },
  { name: "example", path: "/examples/Shapes-And-Color-Shape-Primitives/" },
  { name: "reference index", path: "/reference/" },
  { name: "reference function", path: "/reference/p5/ellipse/" },
  { name: "reference class method", path: "/reference/p5.Vector/add/" },
  { name: "reference p5.sound", path: "/reference/p5.sound/" },
  { name: "404", path: "/no-such-page/" },
];

test.describe("a11y", () => {
  for (const { name, path } of pagesToScan) {
    test(`${name} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(path);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

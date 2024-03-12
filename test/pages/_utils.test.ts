import { expect, test, suite } from "vitest";
import { exampleContentSlugToLegacyWebsiteSlug } from "../../src/pages/_utils";

suite("exampleContentSlugToLegacyWebsiteSlug", () => {
  test("works for english slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "00_structure/01_coordinates/description",
      ),
    ).toBe("structure-coordinates.html");
  });
  test("works for other locale slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "ar/00_structure/01_coordinates/description",
      ),
    ).toBe("ar/structure-coordinates.html");
  });
});

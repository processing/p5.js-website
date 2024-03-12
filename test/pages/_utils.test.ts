import { expect, test, suite } from "vitest";
import { exampleContentSlugToLegacyWebsiteSlug } from "../../src/pages/_utils";

suite("exampleContentSlugToLegacyWebsiteSlug", () => {
  test("works for prefixed english slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "en/00_structure/01_coordinates/description",
      ),
    ).toBe("en/structure-coordinates.html");
  });
  test("works for un-prefixed english slugs", () => {
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

import { expect, test, suite } from "vitest";
import {
  convertContributorDocIndexSlugIfNeeded,
  exampleContentSlugToLegacyWebsiteSlug,
  makeReferencePageSlug,
} from "../../src/pages/_utils";

suite("exampleContentSlugToLegacyWebsiteSlug", () => {
  test("works for prefixed english slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "en/00_structure/01_coordinates/description",
      ),
    ).toBe("structure-coordinates.html");
  });
  test("works for other locale slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "ar/00_structure/01_coordinates/description",
      ),
    ).toBe("structure-coordinates.html");
  });
});

suite("convertContributorDocIndexSlugIfNeeded", () => {
  test("works for prefixed english slugs", () => {
    expect(convertContributorDocIndexSlugIfNeeded("en/readme")).toBe("/en/");
  });
  test("works for un-prefixed english slugs", () => {
    expect(convertContributorDocIndexSlugIfNeeded("readme")).toBe("/");
  });
  test("works for other locale slugs", () => {
    expect(convertContributorDocIndexSlugIfNeeded("es/readme")).toBe("/es/");
  });
  test("works for folders", () => {
    expect(convertContributorDocIndexSlugIfNeeded("en/folder/readme")).toBe(
      "/en/folder/",
    );
  });
});

suite("makeReferencePageSlug", () => {
  test("handles prefixed english slugs", () => {
    expect(makeReferencePageSlug("en/p5.AudioIn/amp.mdx")).toBe(
      "en/p5.AudioIn/amp",
    );
  });
  test("handles un-prefixed english slugs", () => {
    expect(makeReferencePageSlug("p5.AudioIn/amp.mdx")).toBe("p5.AudioIn/amp");
  });
});

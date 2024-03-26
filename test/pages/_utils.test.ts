import { expect, test, suite } from "vitest";
import {
  convertContributorDocIndexSlugIfNeeded,
  exampleContentSlugToLegacyWebsiteSlug,
  removeContentFileExt,
  removeLeadingSlash,
  removeLocaleAndExtension,
} from "@pages/_utils";

suite("exampleContentSlugToLegacyWebsiteSlug", () => {
  test("works for prefixed english slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "en/00_structure/01_coordinates/description",
      ),
    ).toBe("structure-coordinates");
  });
  test("works for other locale slugs", () => {
    expect(
      exampleContentSlugToLegacyWebsiteSlug(
        "ar/00_structure/01_coordinates/description",
      ),
    ).toBe("structure-coordinates");
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

suite("removeContentFileExt", () => {
  test("handles prefixed english slugs", () => {
    expect(removeContentFileExt("en/p5.AudioIn/amp.mdx")).toBe(
      "en/p5.AudioIn/amp",
    );
  });
  test("handles un-prefixed english slugs", () => {
    expect(removeContentFileExt("p5.AudioIn/amp.mdx")).toBe("p5.AudioIn/amp");
  });
});

suite("removeLeadingSlash", () => {
  test("removes leading slash", () => {
    expect(removeLeadingSlash("/path/to/file")).toBe("path/to/file");
  });
  test("does nothing if no leading slash", () => {
    expect(removeLeadingSlash("path/to/file")).toBe("path/to/file");
  });
});

suite("removeLocaleAndExtensionFromId", () => {
  test("removes locale and extension", () => {
    expect(removeLocaleAndExtension("en/p5.AudioIn/amp.mdx")).toBe(
      "p5.AudioIn/amp",
    );
  });
});

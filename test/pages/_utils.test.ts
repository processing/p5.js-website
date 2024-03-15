import { expect, test, suite } from "vitest";
import {
  convertContributorDocIndexSlugIfNeeded,
  exampleContentSlugToLegacyWebsiteSlug,
  makeReferencePageSlug,
  localeMatchingRegex,
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

suite("localeMatchingRegex", () => {
  test("matches locale paths", () => {
    const re = localeMatchingRegex();
    expect("/es/examples/number".match(re)).toHaveLength(1);
    expect("/es/examples/number/".match(re)).toHaveLength(1);
    expect("es/examples/number/".match(re)).toHaveLength(1);
    expect("es/examples/number".match(re)).toHaveLength(1);
  });
  test("matches default locale paths", () => {
    const re = localeMatchingRegex();
    expect("/en/examples/number".match(re)).toHaveLength(1);
    expect("/en/examples/number/".match(re)).toHaveLength(1);
    expect("en/examples/number/".match(re)).toHaveLength(1);
    expect("en/examples/number".match(re)).toHaveLength(1);
  });
  test("matches locale alone", () => {
    const re = localeMatchingRegex();
    expect("/es".match(re)).toHaveLength(1);
    expect("es/".match(re)).toHaveLength(1);
    expect("/es/".match(re)).toHaveLength(1);
    expect("/en".match(re)).toHaveLength(1);
    expect("en/".match(re)).toHaveLength(1);
    expect("/en/".match(re)).toHaveLength(1);
  });
  test("doesnt match unsupported locale prefixes", () => {
    const re = localeMatchingRegex();
    expect("/oo/".match(re)).toBeNull();
    expect("/oo-PL/".match(re)).toBeNull();
  });
  test("doesnt match near urls", () => {
    const re = localeMatchingRegex();
    expect("/english/index".match(re)).toBeNull();
    expect("/features/es".match(re)).toBeNull();
    expect("/features/en/".match(re)).toBeNull();
    expect("/features/es/family/".match(re)).toBeNull();
  });
});

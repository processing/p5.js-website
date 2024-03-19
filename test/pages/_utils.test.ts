import { expect, test, suite } from "vitest";
import {
  convertContributorDocIndexSlugIfNeeded,
  exampleContentSlugToLegacyWebsiteSlug,
  makeReferencePageSlug,
  localeMatchingRegex,
  reformUrlforNewLocale,
  splitLocaleFromPath,
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
    expect("/es/examples/number".match(re)?.[0]).toBe("/es/");
    expect("/es/examples/number/".match(re)?.[0]).toBe("/es/");
    expect("es/examples/number/".match(re)?.[0]).toBe("es/");
    expect("es/examples/number".match(re)?.[0]).toBe("es/");
  });
  test("matches default locale paths", () => {
    const re = localeMatchingRegex();
    expect("/en/examples/number".match(re)?.[0]).toBe("/en/");
    expect("/en/examples/number/".match(re)?.[0]).toBe("/en/");
    expect("en/examples/number/".match(re)?.[0]).toBe("en/");
    expect("en/examples/number".match(re)?.[0]).toBe("en/");
  });
  test("matches locale alone", () => {
    const re = localeMatchingRegex();
    expect("/es".match(re)?.[0]).toBe("/es");
    expect("es/".match(re)?.[0]).toBe("es/");
    expect("/es/".match(re)?.[0]).toBe("/es/");
    expect("/en".match(re)?.[0]).toBe("/en");
    expect("en/".match(re)?.[0]).toBe("en/");
    expect("/en/".match(re)?.[0]).toBe("/en/");
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

suite("reformUrlforNewLocale", () => {
  test("preserves slashes", () => {
    expect(reformUrlforNewLocale("/examples/number", "es")).toBe(
      "/es/examples/number",
    );
    expect(reformUrlforNewLocale("/examples/number/", "es")).toBe(
      "/es/examples/number/",
    );
  });
  test("works for switching collection url locale", () => {
    expect(reformUrlforNewLocale("/past-events/example", "es")).toBe(
      "/es/past-events/example",
    );
    expect(reformUrlforNewLocale("/es/past-events/example", "en")).toBe(
      "/past-events/example",
    );
  });
  test("works for switching collection index locale", () => {
    expect(reformUrlforNewLocale("/reference/", "es")).toBe("/es/reference/");
    expect(reformUrlforNewLocale("/es/reference/", "en")).toBe("/reference/");
  });
  test("works for switching locale at /", () => {
    expect(reformUrlforNewLocale("/", "es")).toBe("/es/");
    expect(reformUrlforNewLocale("/es/", "en")).toBe("/");
  });
});

suite("splitLocaleFromPath", () => {
  test("extracts path", () => {
    expect(splitLocaleFromPath("/es/examples/number")[1]).toBe(
      "/examples/number",
    );
    expect(splitLocaleFromPath("/es/examples/number/")[1]).toBe(
      "/examples/number/",
    );
  });
  test("handles /", () => {
    expect(splitLocaleFromPath("/")[1]).toBe("/");
    expect(splitLocaleFromPath("/")[0]).toBe("en");
    expect(splitLocaleFromPath("/es/")[0]).toBe("es");
    expect(splitLocaleFromPath("/es/")[1]).toBe("/");
    expect(splitLocaleFromPath("/es")[0]).toBe("es");
    expect(splitLocaleFromPath("/es")[1]).toBe("/");
  });
  test("detects prefixed locale", () => {
    expect(splitLocaleFromPath("/es/examples/number")[0]).toBe("es");
    expect(splitLocaleFromPath("/en/past-events/example")[0]).toBe("en");
  });
  test("detects un-prefixed locale", () => {
    expect(splitLocaleFromPath("examples/number")[0]).toBe("en");
  });
  test('works for "relative" paths', () => {
    expect(splitLocaleFromPath("examples")[0]).toBe("en");
    expect(splitLocaleFromPath("examples")[1]).toBe("examples");
    expect(splitLocaleFromPath("en")[0]).toBe("en");
    expect(splitLocaleFromPath("en")[1]).toBe("/");
    expect(splitLocaleFromPath("es")[0]).toBe("es");
    expect(splitLocaleFromPath("es")[1]).toBe("/");
  });
});

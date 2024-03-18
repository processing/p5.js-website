import { expect, test, suite } from "vitest";
import {
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

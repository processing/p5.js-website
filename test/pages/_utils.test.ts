import { expect, test, suite, vi} from "vitest";
import {
  exampleContentSlugToLegacyWebsiteSlug,
  removeContentFileExt,
  removeLeadingSlash,
  removeLocaleAndExtension,
  getFallbackRemixData,
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

vi.mock("astro:content", async (importOriginal) => {
  // 1. Fetch all original exports from astro:content (e.g., reference, z) to prevent schema validation failure
  const actual = await importOriginal() as any;
  
  return {
    ...actual, // 2. Preserve all original module functionalities
    
    // 3. Intercept and mock the getCollection method
    getCollection: vi.fn(async (collectionName) => {
      if (collectionName === "examples") {
        return [
          // English version data: contains remix data, which should be returned when fallback is triggered
          {
            id: "en/02_Animation_And_Variables/00_Drawing_Lines/description.mdx",
            data: {
              remix: [
                {
                  description: "Revised by",
                  attribution: [],
                  code: []
                }
              ]
            }
          },
          // zh-Hans version data: remix data is empty, which should trigger fallback to English remix data
          {
            id: "zh-Hans/02_Animation_And_Variables/00_Drawing_Lines/description.mdx",
            data: {
              remix: [] 
            }
          }
        ];
      }
      return [];
    }),
  };
});

suite("getFallbackRemixData", () => {
  test("returns remix data for English example when current locale example has no remix data", async () => {
    const remixData = await getFallbackRemixData(
      "zh-Hans/02_Animation_And_Variables/00_Drawing_Lines/description.mdx",
      "zh-Hans",
      undefined
    );
    expect(remixData).toBeDefined();
    expect(remixData?.length).toBeGreaterThan(0);
  });
});
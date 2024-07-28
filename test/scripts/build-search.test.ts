import { describe, expect, test, vi } from "vitest";
import { generateSearchIndex } from "../../src/scripts/builders/search";
import type {
  ContentType,
  SearchSupportedLocales,
} from "../../types/content.interface";

vi.mock("../../src/scripts/utils", () => ({
  getContentFilePaths: vi
    .fn()
    .mockResolvedValue([
      "src/content/reference/en/p5/mouseX.mdx",
      "src/content/reference/en/p5.Vector/add.mdx",
      "src/content/reference/en/p5/loadImage.mdx",
    ]),
}));

describe("Search Index Title Generation", () => {
  test("generates correct titles for reference items", async () => {
    const mockContentType: ContentType = "reference";
    const mockLocale: SearchSupportedLocales = "en";

    const result = await generateSearchIndex(mockContentType, mockLocale);

    // Check that the result is defined and contains the expected title keys
    expect(result).toBeDefined();
    expect(result?.["mouseX"]).toBeDefined();
    expect(result?.["p5.Vector.add()"]).toBeDefined();
    expect(result?.["loadImage()"]).toBeDefined();

    // Check for correct relative URLs
    expect(result?.["mouseX"].relativeUrl).toBe("/reference/p5/mouseX");
    expect(result?.["p5.Vector.add()"].relativeUrl).toBe(
      "/reference/p5.Vector/add",
    );
    expect(result?.["loadImage()"].relativeUrl).toBe("/reference/p5/loadImage");

    // Check for alias
    expect(result?.["p5.Vector.add()"].alias).toBe("add");
    expect(result?.["loadImage()"].alias).toBe("loadImage");
  });
});

import { describe, it, expect } from "vitest";
import {
  filterCategoryData,
  normalizeKeyword,
} from "@components/ReferenceDirectoryWithFilter";

// Method titles are stored as name + "()", e.g. "circle()"
const makeEntry = (title: string, description: string) =>
  ({
    id: title,
    slug: title,
    data: {
      title,
      description,
      path: title.replace(/\(\)$/, ""),
    },
  }) as any;

// "using", "single" and "since" all contain "sin" but must not match "sin"
const categoryData: any = [
  {
    name: "Math",
    subcats: [
      {
        name: "Trigonometry",
        entry: undefined,
        entries: [
          makeEntry("sin()", "<p>Calculates the sine of an angle.</p>"),
          makeEntry("asin()", "<p>Calculates the arc sine of a value.</p>"),
          makeEntry("cos()", "<p>Calculates the cosine of an angle.</p>"),
          makeEntry(
            "angleMode()",
            "<p>Sets whether sin and cos use degrees or radians.</p>",
          ),
        ],
      },
      {
        name: "Calculation",
        entry: undefined,
        entries: [
          makeEntry(
            "map()",
            "<p>Re-maps a number using a single input range.</p>",
          ),
          makeEntry(
            "constrain()",
            "<p>Constrains a value computed since the last frame.</p>",
          ),
        ],
      },
    ],
  },
  {
    name: "Typography",
    subcats: [
      {
        name: "Loading & Displaying",
        entry: undefined,
        entries: [
          makeEntry("text()", "<p>Draws text to the canvas.</p>"),
          makeEntry("textFont()", "<p>Sets the font used to draw text.</p>"),
        ],
      },
    ],
  },
  {
    name: "Shape",
    subcats: [
      {
        name: "2D Primitives",
        entry: undefined,
        entries: [
          makeEntry("circle()", "<p>Draws a circle to the canvas.</p>"),
          makeEntry("rect()", "<p>Draws a rectangle to the canvas.</p>"),
        ],
      },
    ],
  },
];

// Flatten surviving entry titles (including a class subcat's own entry)
const titlesOf = (result: any[]): string[] => {
  const titles: string[] = [];
  for (const category of result) {
    for (const subcat of category.subcats) {
      if (subcat.entry) titles.push(subcat.entry.data.title);
      for (const entry of subcat.entries) titles.push(entry.data.title);
    }
  }
  return titles;
};

describe("normalizeKeyword", () => {
  it("trims, lowercases and strips surrounding punctuation", () => {
    expect(normalizeKeyword("  Circle ")).toBe("circle");
    expect(normalizeKeyword("SIN")).toBe("sin");
    // A trailing period (the maintainer's "sin." test) resolves to "sin".
    expect(normalizeKeyword("sin.")).toBe("sin");
    expect(normalizeKeyword("2D Primitives")).toBe("2d primitives");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(normalizeKeyword("")).toBe("");
    expect(normalizeKeyword("   ")).toBe("");
    expect(normalizeKeyword("...")).toBe("");
  });
});

describe("filterCategoryData", () => {
  it("returns the whole tree when the keyword is empty", () => {
    expect(filterCategoryData(categoryData, "")).toBe(categoryData);
    expect(filterCategoryData(categoryData, "   ")).toBe(categoryData);
  });

  it("returns no results for a keyword that matches nothing", () => {
    expect(filterCategoryData(categoryData, "xyzzy")).toEqual([]);
  });

  it('finds a function by its exact name ("circle" -> circle())', () => {
    const titles = titlesOf(filterCategoryData(categoryData, "circle"));
    expect(titles).toContain("circle()");
    expect(titles).not.toContain("rect()");
  });

  it("matches function names case-insensitively", () => {
    expect(titlesOf(filterCategoryData(categoryData, "CIRCLE"))).toContain(
      "circle()",
    );
  });

  it('supports partial/prefix name searches as a fallback ("circ" -> circle())', () => {
    const titles = titlesOf(filterCategoryData(categoryData, "circ"));
    expect(titles).toContain("circle()");
  });

  it('shows a whole section for a category-name search ("typog" -> Typography)', () => {
    const result = filterCategoryData(categoryData, "typog");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Typography");
    expect(titlesOf(result)).toEqual(["text()", "textFont()"]);
  });

  it('shows a whole subcategory for a subcategory-name search ("2D Primitives")', () => {
    const result = filterCategoryData(categoryData, "2D Primitives");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Shape");
    expect(titlesOf(result)).toEqual(["circle()", "rect()"]);
  });

  it("matches a whole word in a description", () => {
    // "single" is a whole word in map()'s description.
    expect(titlesOf(filterCategoryData(categoryData, "single"))).toContain(
      "map()",
    );
  });

  it('excludes partial substrings for "sin" (no "using"/"since"/"single"/"asin")', () => {
    const titles = titlesOf(filterCategoryData(categoryData, "sin"));
    // Included: exact function name + whole-word description match.
    expect(titles).toContain("sin()");
    expect(titles).toContain("angleMode()");
    // Excluded: "sin" only appears as a partial substring of these.
    expect(titles).not.toContain("asin()"); // "asin" contains "sin"
    expect(titles).not.toContain("map()"); // "using", "single"
    expect(titles).not.toContain("constrain()"); // "since"
    expect(titles).not.toContain("cos()"); // "sine" != "sin"
    expect(titles).toEqual(["sin()", "angleMode()"]);
  });

  it('treats "sin." the same as "sin"', () => {
    expect(titlesOf(filterCategoryData(categoryData, "sin."))).toEqual([
      "sin()",
      "angleMode()",
    ]);
  });

  it('treats "SIN" the same as "sin" (case-insensitive)', () => {
    expect(titlesOf(filterCategoryData(categoryData, "SIN"))).toEqual([
      "sin()",
      "angleMode()",
    ]);
  });

  it('an exact function name wins over partial substrings ("asin" -> asin() only)', () => {
    const titles = titlesOf(filterCategoryData(categoryData, "asin"));
    expect(titles).toEqual(["asin()"]);
  });
});

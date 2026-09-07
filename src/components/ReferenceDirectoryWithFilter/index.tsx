import type { ReferenceDocContentItem } from "@/src/content/types";
import { useMemo, useRef, useState } from "preact/hooks";
import { Icon } from "../Icon";
import flask from "@src/content/ui/images/icons/flask.svg?raw";
import warning from "@src/content/ui/images/icons/warning.svg?raw";

type ReferenceDirectoryEntry = ReferenceDocContentItem & {
  data: {
    path: string;
    title: string;
    description: string;
  };
};

type FilteredCategoryData = {
  name: string;
  subcats: {
    name: string;
    entries: ReferenceDirectoryEntry[];
  }[];
};

type ReferenceDirectoryWithFilterProps = {
  categoryData: {
    name: string;
    subcats: {
      name: string;
      entry?: ReferenceDirectoryEntry;
      entries: ReferenceDirectoryEntry[];
    }[];
  }[];
  uiTranslations: { [key: string]: string };
};

/**
 * Convert Reference description to one-line description
 * @param description String description
 * @returns One-line description
 */
const getOneLineDescription = (description: string): string => {
  // Matches first paragraph tag, remove HTML tags, then trim to first fullstop
  const firstParagraphRegex = /^<p>(.*?)<\/p>/;
  let [oneLineDescription] =
    description.replace(/\n/g, " ").trim().match(firstParagraphRegex) ?? [];

  if (!oneLineDescription && description) {
    oneLineDescription = description;
  }

  if (oneLineDescription) {
    oneLineDescription = oneLineDescription
      .replace(/^<p>|<\/p>$/g, "")
      .replace(/<\/?code>/g, "")
      .replace(/<var>(\d+?)<sup>(\d+?)<\/sup><\/var>/g, "$1^$2")
      .replace(/<a href=".*?">|<\/a>/g, "")
      .split(/\.\s|\?\s|!\s|।\s|。/)[0];
  }

  return oneLineDescription ?? "";
};

// Trim, lowercase, and strip surrounding punctuation so "sin." matches sin()
export const normalizeKeyword = (keyword: string): string =>
  keyword.trim().toLowerCase().replace(/^\W+|\W+$/g, "");

type MatchMode = "strict" | "loose";

// Bare name for exact comparison: drop HTML and the trailing "()" of methods
const canonicalName = (name: string | undefined | null): string =>
  (name ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\(\)$/, "")
    .trim()
    .toLowerCase();

// strict: name must equal the keyword (so "sin" != "asin")
// loose: keyword may appear anywhere ("typog" -> "Typography")
const nameMatches = (
  name: string | undefined | null,
  keyword: string,
  mode: MatchMode,
): boolean => {
  if (!name) return false;
  if (mode === "strict") return canonicalName(name) === keyword;
  return name.replace(/<[^>]*>/g, "").toLowerCase().includes(keyword);
};

// Whole-word match: "sin" hits "the sin of an angle" but not "using"/"single"
const wordMatches = (text: string, keyword: string): boolean => {
  if (!text || !keyword) return false;
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .some((token) => token === keyword);
};

// strict: whole-word description match; loose: substring match
const descriptionMatches = (
  description: string | undefined | null,
  keyword: string,
  mode: MatchMode,
): boolean => {
  const text = getOneLineDescription(description ?? "").replace(
    /<[^>]*>/g,
    "",
  );
  if (!text) return false;
  if (mode === "strict") return wordMatches(text, keyword);
  return text.toLowerCase().includes(keyword);
};

const entryMatchesKeyword = (
  entry: ReferenceDirectoryEntry,
  keyword: string,
  mode: MatchMode,
): boolean =>
  nameMatches(entry.data.title, keyword, mode) ||
  descriptionMatches(entry.data.description, keyword, mode);

// Walk the tree once at a fixed strictness: a category/subcategory name match
// pulls in the whole section, otherwise entries match by title or description.
const filterTree = (
  categoryData: ReferenceDirectoryWithFilterProps["categoryData"],
  keyword: string,
  mode: MatchMode,
): FilteredCategoryData[] =>
  categoryData.reduce((acc: FilteredCategoryData[], category) => {
    // If the category name matches, include the whole category.
    if (nameMatches(category.name, keyword, mode)) {
      acc.push(category);
      return acc;
    }

    const filteredSubcats = category.subcats.reduce(
      (subAcc: typeof category.subcats, subcat) => {
        // If the subcategory name matches, include all its entries.
        if (nameMatches(subcat.name, keyword, mode)) {
          subAcc.push(subcat);
          return subAcc;
        }

        const matchingEntries = subcat.entries.filter((entry) =>
          entryMatchesKeyword(entry, keyword, mode),
        );

        // A subcategory that represents a class (e.g. p5.Vector) carries its
        // own entry; match it too.
        if (subcat.entry && entryMatchesKeyword(subcat.entry, keyword, mode)) {
          matchingEntries.push(subcat.entry);
        }

        if (matchingEntries.length > 0) {
          subAcc.push({ ...subcat, entries: matchingEntries });
        }
        return subAcc;
      },
      [],
    );

    if (filteredSubcats.length > 0) {
      acc.push({ ...category, subcats: filteredSubcats });
    }
    return acc;
  }, []);

// Two passes: prefer exact-name / whole-word matches, and only fall back to
// substring matching when nothing precise is found. This keeps partial hits
// like "using"/"since"/"single"/"asin" out of a "sin" search, while still
// letting prefixes like "typog" or "circ" work when there's no exact match.
export const filterCategoryData = (
  categoryData: ReferenceDirectoryWithFilterProps["categoryData"],
  rawKeyword: string,
): FilteredCategoryData[] => {
  const keyword = normalizeKeyword(rawKeyword);
  if (!keyword) return categoryData;

  const strictMatches = filterTree(categoryData, keyword, "strict");
  return strictMatches.length > 0
    ? strictMatches
    : filterTree(categoryData, keyword, "loose");
};

export const ReferenceDirectoryWithFilter = ({
  categoryData,
  uiTranslations,
}: ReferenceDirectoryWithFilterProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEntries = useMemo(
    () => filterCategoryData(categoryData, searchKeyword),
    [categoryData, searchKeyword],
  );

  const renderEntries = (entries: ReferenceDirectoryEntry[]) =>
    entries.length === 0 ? null : (
      <div class="content-grid">
        {entries.map((entry) => (
          <div class="col-span-3 w-full overflow-hidden" key={entry.id}>
            <a
              href={`/reference/${entry.data.path}/`}
              class="group hover:no-underline"
              aria-label={entry.data.title}
              aria-describedby={`${entry.data.title}-description`}
            >
              <span class="text-body-mono group-hover:underline">
                {entry.data.beta && (
                  <div
                    className="mb-[-2px] mr-2 inline-block h-[16px] w-[16px]"
                    dangerouslySetInnerHTML={{ __html: flask }}
                  />
                )}
                {entry.data.deprecated && (
                  <div
                    className="mb-[-2px] mr-2 inline-block h-[16px] w-[16px]"
                    dangerouslySetInnerHTML={{ __html: warning }}
                  />
                )}
                <span dangerouslySetInnerHTML={{ __html: entry.data.title }} />
              </span>
              <p
                class="mt-1 text-sm"
                id={`${entry.data.title}-description`}
              >{`${getOneLineDescription(entry.data.description)}`}</p>
            </a>
          </div>
        ))}
      </div>
    );

  const subcatShouldHaveHeading = (
    subcat: { name: string },
    category: { name: string },
  ) => {
    return !(!subcat.name || !category.name);
  };

  const getSubcatHeading = (
    subcat: { name: string; entry?: any },
    category: { name: string },
  ) => {
    if (!subcatShouldHaveHeading(subcat, category)) {
      return null;
    }

    return (
      <>
        {subcat.entry ? (
          <a
            id={subcat.name}
            href={`/reference/${category.name === "p5.sound" ? "p5.sound" : "p5"}/${subcat.name}/`}
          >
            <h3 className="m-0 py-gutter-md">{subcat.name}</h3>
          </a>
        ) : (
          <h3 className="m-0 py-gutter-md" id={subcat.name}>
            {subcat.name}
          </h3>
        )}
      </>
    );
  };

  const renderCategoryData = () => {
    if (filteredEntries.length === 0) {
      return <div class="mt-lg">{uiTranslations["No Results"]}</div>;
    }
    return filteredEntries.map((category) => (
      <section key={category.name}>
        <h2
          class={
            subcatShouldHaveHeading(category.subcats[0], category)
              ? "mb-0"
              : "mb-[var(--gutter-md)]"
          }
          id={category.name}
        >
          {category.name}
        </h2>
        {category.subcats.map((subcat) => (
          <div key={subcat.name}>
            {getSubcatHeading(subcat, category)}
            {renderEntries(subcat.entries)}
          </div>
        ))}
      </section>
    ));
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setSearchKeyword("");
    }
  };

  return (
    <div>
      <div class="h-0 overflow-visible">
        <div class="content-grid-simple absolute -left-0 -right-0 -top-[60px] h-[75px] border-b border-sidebar-type-color bg-accent-color px-5 pb-lg md:px-lg ">
          <div class="text-body col-span-2 flex w-full max-w-[750px] border-b border-accent-type-color text-accent-type-color">
            <input
              type="text"
              id="search"
              ref={inputRef}
              class="w-full bg-transparent py-xs text-accent-type-color placeholder:text-accent-type-color focus:outline-0"
              placeholder={uiTranslations["Filter by keyword"]}
              onKeyUp={(e) => {
                const target = e.target as HTMLInputElement;
                setSearchKeyword(target?.value);
              }}
            />
            {searchKeyword.length > 0 && (
              <button
                type="reset"
                class=""
                onClick={clearInput}
                aria-label="Clear search input"
              >
                <Icon kind="close" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div class="-top-[75px] mx-5 min-h-[50vh] md:mx-lg">
        {renderCategoryData()}
      </div>
    </div>
  );
};

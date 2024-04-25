import type { ReferenceDocContentItem } from "@/src/content/types";
import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";

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
};

/**
 * Convert Reference description to one-line description
 * @param description String description
 * @returns One-line description
 */
const getOneLineDescription = (description: string): string => {
  // Matches until the first ., ?, !, ।, or 。 followed by a space
  const fullStopRegex = /.*?(?:\.\s|\?\s|!\s|।\s|。\s)/;
  const cleanedDescription = description
    .replace(/<[^>]*>?/gm, "")
    .replace(/\n/g, " ");
  const [oneLineDescription] = cleanedDescription.match(fullStopRegex) ?? [];
  return `${oneLineDescription?.trim()}`;
};

export const ReferenceDirectoryWithFilter = ({
  categoryData,
}: ReferenceDirectoryWithFilterProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredEntries = useMemo(() => {
    if (!searchKeyword) return categoryData;

    return categoryData.reduce((acc: FilteredCategoryData[], category) => {
      const filteredSubcats = category.subcats.reduce(
        (subAcc, subcat) => {
          const filteredEntries = subcat.entries.filter((entry) =>
            entry.data.title.includes(searchKeyword),
          );
          if (filteredEntries.length > 0) {
            subAcc.push({ ...subcat, entries: filteredEntries });
          }
          return subAcc;
        },
        [] as typeof category.subcats,
      );

      if (filteredSubcats.length > 0) {
        acc.push({ ...category, subcats: filteredSubcats });
      }
      return acc;
    }, []);
  }, [categoryData, searchKeyword]);

  const renderEntries = (entries: ReferenceDirectoryEntry[]) => (
    <div class="content-grid">
      {entries.map((entry) => (
        <div class="col-span-3 w-full overflow-hidden" key={entry.id}>
          <a
            href={`/reference/${entry.data.path}`}
            class="text-body-mono"
            aria-label={entry.data.title}
            aria-describedby={`${entry.data.title}-description`}
          >
            <span dangerouslySetInnerHTML={{ __html: entry.data.title }} />
          </a>
          <p
            id={`${entry.data.title}-description`}
          >{`${getOneLineDescription(entry.data.description)}`}</p>
        </div>
      ))}
    </div>
  );

  const renderCategoryData = () =>
    filteredEntries.map((category) => (
      <div class="my-md border-b border-type-color pb-2xl" key={category.name}>
        <h2>
          {category.name}
          <a id={category.name} />
        </h2>
        {category.subcats.map((subcat) => (
          <div key={subcat.name}>
            {subcat.name && (
              <div class="my-lg">
                <h3>
                  {subcat.name}
                  <a id={subcat.name} />
                </h3>
              </div>
            )}
            {renderEntries(subcat.entries)}
          </div>
        ))}
      </div>
    ));

  return (
    <>
      <div class="border-b border-sidebar-type-color bg-accent-color px-lg pb-lg">
        <div class="max-w-screen-md">
          <input
            type="text"
            id="search"
            class="text-body w-full border-b border-accent-type-color bg-transparent py-xs placeholder:text-accent-type-color"
            placeholder="Filter by keyword"
            onKeyUp={(e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              setSearchKeyword(target?.value);
            }}
          />
        </div>
      </div>
      <div class="mx-lg">{renderCategoryData()}</div>
    </>
  );
};

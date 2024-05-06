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
  return `${oneLineDescription?.trim() ?? cleanedDescription}`;
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
            class="group hover:no-underline"
            aria-label={entry.data.title}
            aria-describedby={`${entry.data.title}-description`}
          >
            <span
              class="text-body-mono group-hover:underline"
              dangerouslySetInnerHTML={{ __html: entry.data.title }}
            />
            <p
              class="mt-1 text-sm"
              id={`${entry.data.title}-description`}
            >{`${getOneLineDescription(entry.data.description)}`}</p>
          </a>
        </div>
      ))}
    </div>
  );

  const getSubcatHeading = (
    subcat: { name: string },
    category: { name: string },
  ) => {
    if (!subcat.name || !category.name || subcat.name === "p5.sound") {
      return <div class="mb-sm" />;
    }

    return (
      <div class="my-lg">
        {subcat.name.includes("p5.") ? (
          <a
            id={subcat.name}
            href={`/reference/${category.name === "p5.sound" ? "p5.sound" : "p5"}/${subcat.name}`}
          >
            <h3>{subcat.name}</h3>
          </a>
        ) : (
          <h3>
            {subcat.name}
            <a id={subcat.name} />
          </h3>
        )}
      </div>
    );
  };

  const renderCategoryData = () =>
    filteredEntries.map((category) => (
      <div
        class="my-md border-b border-type-color pb-2xl last:!border-0"
        key={category.name}
      >
        <h2>
          {category.name}
          <a id={category.name} />
        </h2>
        {category.subcats.map((subcat) => (
          <div key={subcat.name}>
            {getSubcatHeading(subcat, category)}
            {renderEntries(subcat.entries)}
          </div>
        ))}
      </div>
    ));

  return (
    <div>
      <div class="h-0 overflow-visible">
        <div class="relative -top-[75px] h-[75px] border-b border-sidebar-type-color bg-accent-color px-5 pb-lg md:px-lg">
          <input
            type="text"
            id="search"
            class="text-body w-full max-w-[750px] border-b border-accent-type-color bg-transparent py-xs placeholder:text-accent-type-color"
            placeholder="Filter by keyword"
            onKeyUp={(e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
              const target = e.target as HTMLInputElement;
              setSearchKeyword(target?.value);
            }}
          />
        </div>
      </div>
      <div class="-top-[75px] mx-5 min-h-[50vh] md:mx-lg">
        {renderCategoryData()}
      </div>
    </div>
  );
};

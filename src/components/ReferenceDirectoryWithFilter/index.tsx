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
          <a href={`/reference/${entry.data.path}`} class="text-body-mono">
            <span dangerouslySetInnerHTML={{ __html: entry.data.title }} />
          </a>
          <p>{`${entry.data.description.replace(/<[^>]*>/g, "").split(/\.(\s|$)/, 1)[0]}.`}</p>
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
      <div class="bg-accent-color px-lg pb-lg">
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

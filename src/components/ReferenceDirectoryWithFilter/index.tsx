import type { ReferenceDocContentItem } from "@/src/content/types";
import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";

type ReferenceDirectoryEntry = ReferenceDocContentItem & {
  data: {
    path: string;
  };
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
    if (!searchKeyword) return [];

    // Flatten all entries and filter by search keyword
    return categoryData.reduce((acc: ReferenceDirectoryEntry[], category) => {
      category.subcats.forEach((subcat) => {
        subcat.entries.forEach((entry) => {
          if (entry.data.title.includes(searchKeyword)) {
            acc.push(entry);
          }
        });
      });
      return acc;
    }, []);
  }, [categoryData, searchKeyword]);

  const renderFilteredEntries = () => {
    return (
      <div class="content-grid my-xl">
        {filteredEntries.map((entry: ReferenceDirectoryEntry) => (
          <div class="col-span-3 w-full overflow-hidden" key={entry.id}>
            <a href={`/reference/${entry.data.path}`} class="text-body-mono">
              {/* Needs to set html directly to render the entries for e.g. the > operator */}
              <span
                dangerouslySetInnerHTML={{
                  __html: entry.data.title,
                }}
              />
            </a>
            <p>
              {`${
                entry.data.description
                  .replace(/<[^>]*>/g, "")
                  .split(/\.(\s|$)/, 1)[0]
              }.`}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultEntries = () =>
    categoryData.map((category) => (
      <div class="my-md border-b border-type-color pb-2xl" key={category.name}>
        <h2>
          {category.name}
          <a id={category.name} />
        </h2>
        {category.subcats.map((subcat) => (
          <div key={subcat.name}>
            {subcat.name && (
              <div class="my-lg">
                {subcat.entry ? (
                  <h3>
                    <a
                      id={subcat.name}
                      href={`/reference/${subcat.entry.data.path}`}
                    >
                      {subcat.name}
                    </a>
                  </h3>
                ) : (
                  <h3>
                    {subcat.name}
                    <a id={subcat.name} />
                  </h3>
                )}
              </div>
            )}
            <div class="content-grid">
              {subcat.entries.map((refEntry) => (
                <div
                  class="col-span-3 w-full overflow-hidden"
                  key={refEntry.id}
                >
                  <a
                    href={`/reference/${refEntry.data.path}`}
                    class="text-body-mono"
                  >
                    {/* Needs set:html to render the entries for e.g. the > operator */}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: refEntry.data.title,
                      }}
                    />
                  </a>
                  <p>
                    {`${
                      refEntry.data.description
                        .replace(/<[^>]*>/g, "")
                        .split(/\.(\s|$)/, 1)[0]
                    }.`}
                  </p>
                </div>
              ))}
            </div>
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
      <div class="mx-lg">
        {searchKeyword ? renderFilteredEntries() : renderDefaultEntries()}
      </div>
    </>
  );
};

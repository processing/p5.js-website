import type { ReferenceDocContentItem } from "@/src/content/types";
import { useMemo, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import { Icon } from "../Icon";

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
  uiTranslations,
}: ReferenceDirectoryWithFilterProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEntries = useMemo(() => {
    if (!searchKeyword) return categoryData;

    return categoryData.reduce((acc: FilteredCategoryData[], category) => {
      const filteredSubcats = category.subcats.reduce(
        (subAcc, subcat) => {
          const filteredEntries = subcat.entries.filter((entry) =>
            entry.data.title
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()),
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
              <span
                class="text-body-mono group-hover:underline"
              >
                {entry.data.beta && (
                  <img
                    className="inline-block align-center mr-2"
                    src="/icons/flask.svg"
                    alt="(Experimental)"
                    width={16}
                    height={16}
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
    return !(!subcat.name || !category.name || subcat.name === "p5.sound");
  }

  const getSubcatHeading = (
    subcat: { name: string },
    category: { name: string },
  ) => {
    if (!subcatShouldHaveHeading(subcat, category)) {
      return null;
    }

    return (
      <>
        {subcat.name.includes("p5.") ? (
          <a
            id={subcat.name}
            href={`/reference/${category.name === "p5.sound" ? "p5.sound" : "p5"}/${subcat.name}`}
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
        <div class="content-grid-simple absolute -top-[75px] -left-0 -right-0 h-[75px] border-b border-sidebar-type-color bg-accent-color px-5 pb-lg md:px-lg ">
          <div class="text-body col-span-2 flex w-full max-w-[750px] border-b border-accent-type-color text-accent-type-color">
            <input
              type="text"
              id="search"
              ref={inputRef}
              class="w-full bg-transparent py-xs text-accent-type-color placeholder:text-accent-type-color focus:outline-0"
              placeholder={uiTranslations["Filter by keyword"]}
              onKeyUp={(e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;
                setSearchKeyword(target?.value);
              }}
            />
            {searchKeyword.length > 0 && (
              <button type="reset" class="" onClick={clearInput}>
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

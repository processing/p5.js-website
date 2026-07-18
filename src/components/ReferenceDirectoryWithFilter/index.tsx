import { useMemo, useState } from "preact/hooks";
import type { ReferenceDocContentItem } from "@/src/content/types";
import flask from "@src/content/ui/images/icons/flask.svg?raw";
import warning from "@src/content/ui/images/icons/warning.svg?raw";

type ReferenceDirectoryEntry = ReferenceDocContentItem & {
  data: {
    path: string;
    title: string;
    description: string;
  };
};

type ReferenceDirectorySubcategory = {
  name: string;
  entry?: ReferenceDirectoryEntry;
  entries: ReferenceDirectoryEntry[];
};

type ReferenceDirectoryCategory = {
  name: string;
  subcats: ReferenceDirectorySubcategory[];
};

type ReferenceDirectoryProps = {
  categoryData: ReferenceDirectoryCategory[];
};

const normalizeSearchText = (value: string): string =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

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

export const ReferenceDirectoryWithFilter = ({
  categoryData,
}: ReferenceDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategoryData = useMemo<ReferenceDirectoryCategory[]>(() => {
    const normalizedQuery = normalizeSearchText(searchTerm);

    if (!normalizedQuery) {
      return categoryData;
    }

    return categoryData
      .map((category) => ({
        ...category,
        subcats: category.subcats
          .map((subcat) => ({
            ...subcat,
            entries: subcat.entries.filter((entry) => {
              const searchableText = `${entry.data.title} ${entry.data.description}`;

              return normalizeSearchText(searchableText).includes(
                normalizedQuery,
              );
            }),
          }))
          .filter((subcat) => subcat.entries.length > 0),
      }))
      .filter((category) => category.subcats.length > 0);
  }, [categoryData, searchTerm]);

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
    subcat: ReferenceDirectorySubcategory,
    category: ReferenceDirectoryCategory,
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
    if (filteredCategoryData.length === 0) {
      return (
        <p class="text-body-large mt-[var(--gutter-lg)]">
          No matching references found.
        </p>
      );
    }

    return filteredCategoryData.map((category) => (
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

  return (
    <div class="-top-[75px] mx-5 min-h-[50vh] md:mx-lg">
      <div class="mb-[var(--gutter-lg)] max-w-[32rem]">
        <label class="sr-only" for="reference-directory-filter">
          Search references
        </label>
        <input
          id="reference-directory-filter"
          type="search"
          value={searchTerm}
          onInput={(event) => {
            setSearchTerm(event.currentTarget.value);
          }}
          placeholder="Search references"
          aria-label="Search references"
          class="w-full rounded-[20px] border border-sidebar-type-color bg-body-color px-md py-3 text-body-large placeholder-sidebar-type-color focus:outline-0"
        />
      </div>
      {renderCategoryData()}
    </div>
  );
};

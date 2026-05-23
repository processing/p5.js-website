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

type ReferenceDirectoryProps = {
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
    return categoryData.map((category) => (
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
      {renderCategoryData()}
    </div>
  );
};

import { useMemo, useRef, useState } from "preact/hooks";
import { Icon } from "../Icon";
import { type JSX } from "preact";

type SearchResult = {
  id: number;
  category: string;
  title: string;
  relativeUrl: string;
};

type SearchResultProps = {
  results: SearchResult[];
  searchTerm: string;
  currentLocale: string;
  onSearchChange: JSX.GenericEventHandler<HTMLInputElement>;
  uiTranslations: Record<string, string>;
};

const SearchResults = ({
  results,
  searchTerm,
  onSearchChange,
  uiTranslations,
}: SearchResultProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentFilter, setCurrentFilter] = useState("");

  const allUniqueCategoriesForResults = useMemo(() => {
    const categories = results.map((result) => result.category);
    return [...new Set(categories)];
  }, [results]);

  const uniqueCategories = useMemo(() => {
    if (currentFilter) {
      return [currentFilter];
    }
    return allUniqueCategoriesForResults;
  }, [currentFilter, allUniqueCategoriesForResults]);

  const uiTranslationKey = (category: string) => {
    return (
      category
        // words in a category slugs are separated by dashes
        .split("-")
        .map((word) => {
          // Capitalize the first letter of the word
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ")
    );
  };

  const toggleFilter = (category: string) => {
    if (currentFilter === category) {
      setCurrentFilter("");
    } else {
      setCurrentFilter(category);
    }
  };

  const renderFilterByOptions = () => {
    if (results.length === 0) {
      return null;
    }

    return (
      <div className="flex w-fit py-lg">
        <p className="mt-0 w-fit text-nowrap">Filter by</p>
        <ul className="ml-sm flex gap-sm">
          {allUniqueCategoriesForResults.map((category) => (
            <li
              key={category}
              className={`${currentFilter === category ? "bg-sidebar-type-color text-bg-color" : "bg-bg-color text-sidebar-type-color"} h-[25px] rounded-[20px] border border-sidebar-type-color px-xs py-[0.1rem] hover:bg-sidebar-type-color hover:text-bg-color md:h-[30px]`}
            >
              <button
                value={category}
                className="capitalize"
                onClick={() => toggleFilter(category)}
              >
                <div class="flex flex-nowrap gap-xs">
                  {uiTranslations[uiTranslationKey(category)]}
                  {currentFilter === category && (
                    <Icon kind="close" className="h-4 w-4 place-self-center" />
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const renderBigSearchForm = () => {
    return (
      <search
        role="search"
        class="bg-body-color relative flex h-[64px] w-full items-center rounded-[50px] border border-sidebar-type-color"
      >
        <input
          id="search-term"
          type="search"
          ref={inputRef}
          value={searchTerm}
          placeholder={uiTranslations["Search"]}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearchChange(e);
            }
          }}
          class="h-fit w-full appearance-none bg-transparent px-md text-4xl placeholder-sidebar-type-color"
          aria-label="Search through site content"
          required
        />
        <button
          type="reset"
          class="absolute right-0 top-0 px-[22px] py-[13px]"
          onClick={clearInput}
        >
          <Icon kind="close-lg" />
        </button>
      </search>
    );
  };

  const renderResults = () => {
    if (results.length === 0) {
      return (
        <p class="text-body-large pb-xs">{uiTranslations["No Results"]}</p>
      );
    }
    return (
      <>
        {uniqueCategories.map((category) => (
          <div key={category}>
            <hr />
            <h2>{uiTranslations[uiTranslationKey(category)]}</h2>
            <ul className="mb-4xl mt-lg">
              {results
                .filter((result) => result.category === category)
                .map((result) => (
                  <li key={result.id} className="text-body-large my-sm">
                    <a href={result.relativeUrl}>{result.title}</a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="py-2xl md:py-3xl">
      <div class="sticky top-0 bg-bg-color">
        <p className="mt-0 pb-xs pt-md">{results.length} results found for</p>
        {renderBigSearchForm()}
      </div>
      <div className="no-scrollbar w-full overflow-x-scroll">
        {renderFilterByOptions()}
      </div>

      {renderResults()}
    </div>
  );
};

export default SearchResults;

import { useEffect, useMemo, useRef, useState } from "preact/hooks";
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
  const [placeholder, setPlaceholder] = useState(searchTerm);
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

  const toggleFilter = (category: string) => {
    if (currentFilter === category) {
      setCurrentFilter("");
    } else {
      setCurrentFilter(category);
    }
  };

  useEffect(() => {
    setPlaceholder(searchTerm);
  }, [searchTerm]);

  const renderFilterByOptions = () => {
    return (
      <div className="flex w-fit py-lg">
        <p className="mt-0 w-fit text-nowrap">Filter by</p>
        <ul className="ml-sm flex gap-sm">
          {allUniqueCategoriesForResults.map((category) => (
            <li
              key={category}
              className={`${currentFilter === category ? "bg-sidebar-type-color text-sidebar-bg-color" : "bg-sidebar-bg-color text-sidebar-type-color"} h-[25px] rounded-[20px] border border-sidebar-type-color px-xs py-[0.1rem] hover:bg-sidebar-type-color hover:text-sidebar-bg-color md:h-[30px]`}
            >
              <button
                value={category}
                className="capitalize"
                onClick={() => toggleFilter(category)}
              >
                {
                  uiTranslations[
                    category.slice(0, 1).toUpperCase() + category.slice(1)
                  ]
                }
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const clearInput = () => {
    setPlaceholder("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const renderBigSearchForm = () => {
    return (
      <search
        role="search"
        class="relative flex h-[64px] w-full items-center rounded-[50px] border border-sidebar-type-color bg-sidebar-bg-color"
      >
        <input
          id="search-term"
          type="search"
          ref={inputRef}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearchChange(e);
            }
          }}
          class="h-fit w-full appearance-none bg-transparent px-md  text-4xl placeholder-sidebar-type-color"
          aria-label="Search through site content"
          required
        />
        <button
          type="reset"
          class="absolute right-0 top-0 px-[22px] py-[13px]"
          onClick={clearInput}
        >
          <Icon kind="close" />
        </button>
      </search>
    );
  };

  if (results.length === 0) {
    return (
      <div class="py-2xl md:py-3xl">
        <p class="text-body-large pb-xs">No results found</p>
      </div>
    );
  }

  return (
    <div className="py-2xl md:py-3xl">
      <p className="pb-xs">{results.length} results found for</p>
      {renderBigSearchForm()}
      <div className="no-scrollbar w-full overflow-x-scroll">
        {renderFilterByOptions()}
      </div>
      <hr />
      {uniqueCategories.map((category) => (
        <div key={category}>
          <h2>
            {
              uiTranslations[
                category.slice(0, 1).toUpperCase() + category.slice(1)
              ]
            }
          </h2>
          <ul className="mb-4xl mt-lg">
            {results
              .filter((result) => result.category === category)
              .map((result) => (
                <li key={result.id} className="text-body-large my-sm">
                  <a href={result.relativeUrl}>{result.title}</a>
                </li>
              ))}
          </ul>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default SearchResults;

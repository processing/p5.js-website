import { useMemo, useRef, useState, useEffect } from "preact/hooks";
import { Icon } from "../Icon";

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
  onSearchChange: (term?: string) => void;
  uiTranslations: Record<string, string>;
};

const SearchResults = ({
  results,
  searchTerm,
  onSearchChange,
  uiTranslations,
}: SearchResultProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [currentFilter, setCurrentFilter] = useState("");
  const [isInputEdited, setInputEdited] = useState(false);

  useEffect(() => {
    if (searchTerm && clearButtonRef.current) {
      clearButtonRef.current.focus();
    } else if (!searchTerm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchTerm]);

  const allUniqueCategoriesForResults = useMemo(() => {
    const categories = results.map((result) => result.category);
    return [...new Set(categories)];
  }, [results]);

  const uniqueCategories = useMemo(() => {
    return currentFilter ? [currentFilter] : allUniqueCategoriesForResults;
  }, [currentFilter, allUniqueCategoriesForResults]);

  const uiTranslationKey = (category: string) =>
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const toggleFilter = (category: string) => {
    setCurrentFilter((prev) => (prev === category ? "" : category));
  };

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = "";
    setInputEdited(false);
    onSearchChange("");
  };

  const submitInput = () => {
    if (inputRef.current) onSearchChange(inputRef.current.value);
  };

  const renderBigSearchForm = () => (
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
          setInputEdited(true);
          if (e.key === "Enter") {
            e.preventDefault();
            submitInput();
          }
        }}
        class="h-fit w-full appearance-none bg-transparent px-md text-4xl placeholder-sidebar-type-color focus:outline-0"
        aria-label="Search through site content"
        required
      />
      {isInputEdited ? (
        <button
          ref={submitButtonRef}
          type="submit"
          class="absolute right-0 top-[2px] px-[22px] py-[13px]"
          onClick={submitInput}
          aria-label="Submit search"
        >
          <Icon kind="arrow-lg" />
        </button>
      ) : (
        <button
          ref={clearButtonRef}
          type="reset"
          class="absolute right-0 top-0 px-[22px] py-[13px]"
          onClick={clearInput}
          aria-label="Clear search input"
        >
          <Icon kind="close-lg" />
        </button>
      )}
    </search>
  );

  const renderFilterByOptions = () => {
    if (results.length === 0) return null;

    return (
      <div className="flex w-fit py-lg">
        <p className="mt-0 w-fit text-nowrap">Filter by</p>
        <ul className="ml-sm flex gap-sm">
          {allUniqueCategoriesForResults.map((category) => (
            <li
              key={category}
              className={`${
                currentFilter === category
                  ? "bg-sidebar-type-color text-bg-color"
                  : "bg-bg-color text-sidebar-type-color"
              } h-[25px] rounded-[20px] border border-sidebar-type-color px-xs py-[0.1rem] hover:bg-sidebar-type-color hover:text-bg-color md:h-[30px]`}
            >
              <button
                value={category}
                className="capitalize"
                onClick={() => toggleFilter(category)}
                aria-pressed={currentFilter === category}
                aria-label={`Filter by ${uiTranslations[uiTranslationKey(category)]}`}
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
        <p className="mt-0 pb-xs pt-md">
          {results.length} results found for
        </p>
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

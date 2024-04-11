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
};

const SearchResults = ({
  results,
  searchTerm,
  currentLocale,
  onSearchChange,
}: SearchResultProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState(searchTerm);

  const uniqueCategories = useMemo(() => {
    const categories = results.map((result) => result.category);
    return [...new Set(categories)];
  }, [results]);

  useEffect(() => {
    setPlaceholder(searchTerm);
  }, [searchTerm]);

  const renderFilterByOptions = () => {
    return uniqueCategories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ));
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
        action={`${currentLocale === "en" ? "" : `/${currentLocale}`}/search`}
        method="GET"
        role="search"
        class="relative flex h-[64px] w-full items-center rounded-[50px] border border-sidebar-type-color bg-sidebar-bg-color"
      >
        <input
          id="search-term"
          type="search"
          ref={inputRef}
          placeholder={placeholder}
          name="term"
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

  return (
    <div className="pt-3xl">
      <p>{results.length} results found for</p>
      {renderBigSearchForm()}
      {renderFilterByOptions()}
      <hr />
      {uniqueCategories.map((category) => (
        <div key={category}>
          <h2 className="capitalize">{category}</h2>
          <ul>
            {results
              .filter((result) => result.category === category)
              .map((result) => (
                <li key={result.id}>
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

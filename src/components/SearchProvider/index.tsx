import { useEffect, useState } from "preact/hooks";
import Fuse, { type FuseResult } from "fuse.js";
import SearchResults from "../SearchResults";

interface SearchProviderProps {
  currentLocale?: string;
  uiTranslations: Record<string, string>;
}

type SearchResult = {
  id: number;
  category: string;
  title: string;
  relativeUrl: string;
  description?: string;
};

/**
 * SearchProvider this component is responsible for handling client-side search.
 * It reads the search term from query params and fetches the search index for the current locale.
 * It then uses Fuse.js to search the index and display the results.
 * @param {string} currentLocale - The current locale
 */
const SearchProvider = ({
  currentLocale,
  uiTranslations,
}: SearchProviderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Flattens the search index data
  const flattenData = (data: FuseResult<SearchResult>) => {
    const flatData: SearchResult[] = [];
    let flatId = 0;
    Object.entries(data).forEach(([category, entries]) => {
      Object.entries(entries).forEach(([title, docDetails]) => {
        const relativeUrl = docDetails.relativeUrl;
        docDetails.relativeUrl = `/${currentLocale}/${relativeUrl}`;
        flatData.push({
          id: flatId++,
          category: category.replace("-fallback", ""),
          title,
          ...docDetails,
        });
      });
    });

    return flatData;
  };

  // Read the search term from query params on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("term");
    if (query) setSearchTerm(query);
  }, []);

  // Fetch the search index for the current locale and search for the search term
  // This effect runs whenever the search term or the current locale changes
  useEffect(() => {
    if (!currentLocale) {
      console.warn("No locale provided to SearchProvider");
      return;
    }

    if (!searchTerm) return;

    let flatData;

    fetch(`/search-indices/${currentLocale}.json`)
      .then((response) => response.json())
      .then((data) => {
        flatData = flattenData(data);

        const fuseOptions = {
          includeScore: true,
          keys: ["title", "description"],
          shouldSort: true,
          threshold: 0.3,
        };

        const fuse = new Fuse(flatData, fuseOptions);

        const searchResults = fuse
          .search(searchTerm)
          .map((result) => result.item);

        setResults(searchResults);
      })
      .catch((error) =>
        console.error("Error fetching or indexing data:", error),
      );
  }, [searchTerm, currentLocale]);

  const handleSearchTermChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const { value } = target;
    if (value) {
      setSearchTerm(target.value);
    }
  };

  return (
    <SearchResults
      results={results}
      searchTerm={searchTerm}
      currentLocale={currentLocale as string}
      onSearchChange={handleSearchTermChange}
      uiTranslations={uiTranslations}
    />
  );
};

export default SearchProvider;

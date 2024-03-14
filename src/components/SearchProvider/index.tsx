import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import Fuse from "fuse.js";

interface SearchProviderProps {
  currentLocale: string;
}

const SearchProvider = ({ currentLocale }: SearchProviderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const flattenData = (data) => {
    const flatData = [];
    let flatId = 0;
    Object.entries(data).forEach(([category, entries]) => {
      Object.entries(entries).forEach(([title, docDetails]) => {
        flatData.push({
          id: flatId++,
          category,
          title,
          ...docDetails,
        });
      });
    });

    return flatData;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("term");
    setSearchTerm(query);
  }, []);

  useEffect(() => {
    if (!currentLocale) {
      console.warn("No locale provided to SearchProvider");
      return;
    }

    if (!searchTerm) return;

    let flatData;

    fetch(`./search-indices/${currentLocale}.json`)
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

  const renderSearchResults = () => {
    if (!results) {
      return <p>Searching ...</p>;
    }

    if (results.length === 0) {
      return <p>No results found</p>;
    }

    return (
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            <a href={result.relativeUrl}>{result.title}</a>
          </li>
        ))}
      </ul>
    );
  };

  if (!searchTerm) return null;

  return (
    <div>
      <h2>Search Results for: {searchTerm}</h2>
      {renderSearchResults()}
    </div>
  );
};

export default SearchProvider;

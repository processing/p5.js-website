import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import FlexSearch from "flexsearch";

interface SearchProviderProps {
  currentLocale: string;
}

const SearchProvider = ({ currentLocale }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const flattenData = (data) => {
    const flatData = [];
    console.log(data);
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

    if (!query) return;

    let flatData; // Store flat data outside fetch scope for later access

    const index = new FlexSearch.Index({
      tokenize: "forward",
      resolution: 9,
      threshold: 0.001,
      depth: 9,
      latin: "extra",
    });

    fetch(`./search-indices/${currentLocale}.json`)
      .then((response) => response.json())
      .then((data) => {
        flatData = flattenData(data);
        flatData.forEach((doc) => {
          index.add(doc.id, doc.title + " " + doc.description);
        });
        return index.search({
          query,
          suggest: true,
        });
      })
      .then((searchResults) => {
        const mappedResults = searchResults.map((r) => {
          return flatData[r];
        });

        setResults(mappedResults);
      })
      .catch((error) =>
        console.error("Error fetching or indexing data:", error),
      );
  }, []);

  return (
    <div>
      <h2>Search Results for: {searchTerm}</h2>
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            <a href={result.relativeUrl}>{result.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchProvider;

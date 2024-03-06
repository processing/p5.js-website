import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import FlexSearch from "flexsearch";

const SearchProvider = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const flattenData = (data) => {
    const flatData = [];

    Object.entries(data).forEach(([category, languages]) => {
      Object.entries(languages).forEach(([language, documents]) => {
        Object.entries(documents).forEach(([docName, docDetails]) => {
          flatData.push({
            id: `${category}_${language}_${docName}`, // Ensure there's a unique ID for each doc
            category,
            language,
            docName,
            ...docDetails, // Spread other details you may want to index/search
          });
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

    const index = new FlexSearch.Document({
      document: {
        id: "id",
        index: ["docName", "description", "relativeUrl"], // Fields to index
      },
    });

    fetch(`./searchIndices/searchIndex.json`)
      .then((response) => response.json())
      .then((data) => {
        flatData = flattenData(data); // Flatten and store the data
        flatData.forEach((doc) => index.add(doc)); // Add each document to the index
        return index.search({
          field: ["docName", "description"], // Specify fields to search in
          query: query,
        });
      })
      .then((searchResults) => {
        // Map search result IDs back to original item data
        const mappedResults = searchResults[0].result.map((id) =>
          flatData.find((item) => item.id === id),
        );
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
            {result.docName} - {result.category} - {result.title} -{" "}
            {result.relativeUrl}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchProvider;

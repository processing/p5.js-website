export const transformEntries = (entries) =>
  entries.reduce((acc, entry) => {
    acc[entry.id.replace(/\.mdx$/, "")] = entry;
    return acc;
  }, {});

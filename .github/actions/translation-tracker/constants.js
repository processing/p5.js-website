const SUPPORTED_LANGUAGES = ['es', 'hi', 'ko', 'zh-Hans'];
const CONTENT_TYPES = ['examples', 'reference', 'tutorials', 'text-detail', 'events', 'libraries'];

/** Frontmatter fields copied into stubs (English values). Avoids duplicating params/examples. */
const STUB_FRONTMATTER_KEYS = {
  reference: ['title', 'module', 'submodule', 'file', 'description'],
  examples: ['title', 'oneLineDescription', 'featuredImage', 'featuredImageAlt'],
  tutorials: ['title', 'description'],
  'text-detail': ['title', 'description'],
  events: ['title', 'description'],
  libraries: ['title', 'description'],
};

module.exports = {
  SUPPORTED_LANGUAGES,
  CONTENT_TYPES,
  STUB_FRONTMATTER_KEYS,
};

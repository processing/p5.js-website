export function normalizeP5ReferenceLinks(
  html: string | undefined,
): string | undefined {
  if (!html) return html;

  return html.replace(
    /href="#\/(p5(?:[./][^"]+))"/g,
    (_match, rawReferencePath: string) => {
      const normalizedReferencePath = rawReferencePath.startsWith("p5.")
        ? `p5/${rawReferencePath}`
        : rawReferencePath;

      const trimmedReferencePath = normalizedReferencePath.replace(/\/+$/, "");
      return `href="/reference/${trimmedReferencePath}/"`;
    },
  );
}

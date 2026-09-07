export interface Attribution {
  name: string;
  URL?: string;
}

export interface RemixCodeLink {
  label?: string;
  URL?: string;
}

export interface RemixEntry {
  description?: string;
  attribution?: Attribution[];
  collectivelyAttributedSince?: number;
  code?: RemixCodeLink[];
}

export interface ExampleAttributionData {
  remixes: {
    description: string;
    attribution: Attribution[];
  }[];
  collectivelyAttributedSince?: number;
  codeLinks: RemixCodeLink[];
}

export const EXAMPLE_ATTRIBUTION = {
  contributors: {
    name: "p5.js Contributors",
    URL: "https://github.com/processing/p5.js?tab=readme-ov-file#contributors",
  },
  foundation: {
    name: "Processing Foundation",
    URL: "https://processingfoundation.org/people",
  },
  license: {
    name: "CC BY-NC-SA 4.0",
    URL: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
};

/**
 * Resolves attribution information for an example.
 *
 * This function is the shared source of truth for both the website
 * attribution display and OpenProcessing sketch attribution.
 */
export function getExampleAttributionData(
  remixData: RemixEntry[] = []
): ExampleAttributionData {
  const remixes = remixData
    .filter(
      (item) =>
        !item.collectivelyAttributedSince &&
        Boolean(item.attribution?.length)
    )
    .map((item) => ({
      description: item.description ?? "Based on",
      attribution: item.attribution ?? [],
    }));

  const collectivelyAttributedSince = remixData.reduce<
    number | undefined
  >(
    (year, item) =>
      item.collectivelyAttributedSince ?? year,
    undefined
  );

  const codeLinks = remixData
    .flatMap((item) => item.code ?? [])
    .filter((item) => Boolean(item.URL));

  return {
    remixes,
    collectivelyAttributedSince,
    codeLinks,
  };
}

/**
 * Creates plain-text attribution that can be embedded in an
 * OpenProcessing sketch.
 */
export function generateExampleAttribution(
  title: string,
  remixData?: RemixEntry[]
): string {
  const attributionData = getExampleAttributionData(remixData);

  const lines: string[] = [title, ""];

  for (const remix of attributionData.remixes) {
    const authors = remix.attribution
      .map((author) =>
        author.URL
          ? `${author.name} (${author.URL})`
          : author.name
      )
      .join(", ");

    lines.push(`${remix.description}: ${authors}`);
  }

  if (attributionData.collectivelyAttributedSince) {
    lines.push(
      `From ${attributionData.collectivelyAttributedSince} onwards, edited and maintained by ${EXAMPLE_ATTRIBUTION.contributors.name} and ${EXAMPLE_ATTRIBUTION.foundation.name}.`
    );
  } else {
    lines.push(
      `Edited and maintained by ${EXAMPLE_ATTRIBUTION.contributors.name} and ${EXAMPLE_ATTRIBUTION.foundation.name}.`
    );
  }

  lines.push(
    `Licensed under ${EXAMPLE_ATTRIBUTION.license.name}.`
  );

  return lines.join("\n");
}

/**
 * Adds attribution as JavaScript comments above the sketch code.
 */
export function addAttributionToCode(
  code: string,
  title: string,
  remixData?: RemixEntry[]
): string {
  const attribution = generateExampleAttribution(
    title,
    remixData
  );

  const comment = attribution
    .split("\n")
    .map((line) => `// ${line}`)
    .join("\n");

  return `${comment}\n\n${code}`;
}
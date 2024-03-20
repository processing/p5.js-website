import { nonDefaultSupportedLocales } from "@/const";
import type { MiddlewareNext } from "astro";
import { load } from "cheerio";
/**
 * This middleware ensures that all links in the HTML have the correct locale prefix.
 * This lifts some of the burden from authors so that they don't have to manually
 * ensure that translations prefix relative links.
 * This will also run on the build server to both dev and prod
 * html files will be modified.
 *
 * @param context The middleware context objet
 * @param next The next middleware or request handler
 * @returns
 */
export async function onRequest(
  { request }: { request: Request },
  next: MiddlewareNext,
) {
  // Proceed with the next middleware or request handler and capture the response
  const response = await next();

  // Ensure we only modify HTML responses
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();

  // Extract the currentLocale from the request URL
  const url = new URL(request.url);
  // Check the first segment
  const pathSegments = url.pathname.split("/").filter(Boolean);
  let currentLocale = ""; // Assume default locale initially which doesn't prefix
  if (
    pathSegments.length > 0 &&
    nonDefaultSupportedLocales.includes(pathSegments[0])
  ) {
    currentLocale = pathSegments[0];
  }

  let modifiedHtml = html;

  // If we have a currentLocale, modify the HTML to ensure all links
  // have the correct locale prefix
  if (currentLocale) {
    modifiedHtml = ensureCorrectLocalePrefixesInHtmlLinks(html, currentLocale);
  }

  // Return a new Response with the modified HTML
  return new Response(modifiedHtml, {
    status: 200,
    headers: response.headers,
  });
}

export const ensureCorrectLocalePrefixesInHtmlLinks = (
  html: string,
  currentLocale: string,
) => {
  const $ = load(html);

  // Modify the href attributes of <a> tags so that authors don't
  // have to worry about locale prefixes
  $("a").each(function () {
    let href = $(this).attr("href");
    // Skip if href is undefined, an external link, or written with a dot slash
    if (!href || href.startsWith("http") || href.startsWith("./")) return;

    const startsWithLocale = nonDefaultSupportedLocales.some(
      (locale) => href && href.startsWith(`/${locale}/`),
    );

    // Only prepend currentLocale if it's not empty and href doesn't
    // already start with a locale
    if (currentLocale && !startsWithLocale) {
      href = `/${currentLocale}${href.startsWith("/") ? "" : "/"}${href}`;
      $(this).attr("href", href);
    }
  });

  // Serialize the modified document back to HTML
  return $.html();
};

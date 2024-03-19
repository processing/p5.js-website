import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { nonDefaultSupportedLocales } from "@/const";

const outputDir = path.join("dist");

function modifyHrefInHtml(filePath, locale) {
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  $("a").each(function () {
    let href = $(this).attr("href");
    if (!href) return; // Skip if href is undefined or null

    // Check if href starts with "http" or any of the non-default locales
    const startsWithHttp = href.startsWith("http");
    const startsWithLocale = nonDefaultSupportedLocales.some((locale) =>
      href.startsWith(`/${locale}/`),
    );

    if (!startsWithHttp && !startsWithLocale) {
      // Prepend locale to hrefs not starting with "http" or a locale,
      // including those not starting with "/".
      href = href.startsWith("/") ? `/${locale}${href}` : `/${locale}/${href}`;
      $(this).attr("href", href);
    }
  });

  fs.writeFileSync(filePath, $.html(), "utf8");
}

function traverseDirectory(dir: string, locale = "") {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (nonDefaultSupportedLocales.includes(dirent.name)) {
        // If the directory name is a supported locale, use it as the locale
        traverseDirectory(fullPath, dirent.name);
      } else {
        // Continue traversing without changing the locale
        traverseDirectory(fullPath, locale);
      }
    } else if (fullPath.endsWith(".html") && locale) {
      modifyHrefInHtml(fullPath, locale);
    }
  });
}

traverseDirectory(outputDir);

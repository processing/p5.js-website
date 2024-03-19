import { nonDefaultSupportedLocales } from "../../const";
import cheerio from "cheerio";

export const localeHrefModifier = () => {
  return {
    name: "locale-href-modifier",
    hooks: {
      "astro:transform": async ({ filename, html, logger }) => {
        logger.info("FILENAME", filename);
        if (!filename.endsWith(".html")) return;

        const $ = cheerio.load(html);
        const locale = nonDefaultSupportedLocales.find((loc) =>
          filename.includes(`/${loc}/`),
        );

        if (!locale) return html;

        $("a").each(function () {
          let href = $(this).attr("href");
          if (!href || href.startsWith("http")) return;

          const startsWithLocale = nonDefaultSupportedLocales.some((loc) =>
            href?.startsWith(`/${loc}/`),
          );
          if (startsWithLocale) return;

          href = href.startsWith("/")
            ? `/${locale}${href}`
            : `/${locale}/${href}`;
          $(this).attr("href", href);
        });

        return $.html();
      },
    },
  };
};

export const devLocaleHrefModifier = () => {
  return {
    name: "dev-mode-locale-href-modifier",
    hooks: {
      "astro:server:setup": ({ server }) => {
        console.log("server", server);
        server.middlewares.use((req, res, next) => {
          const originalSend = res.send;

          res.send = function (body) {
            if (req.url.endsWith(".html")) {
              const modifiedBody = modifyHtml(body);
            }
            return originalSend.apply(this, arguments);
          };

          next();
        });
      },
    },
  };
};

function modifyHtml(html) {
  console.log("Modifying HTML:", html);
  return html;
}

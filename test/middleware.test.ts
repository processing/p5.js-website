import { expect, test, suite } from "vitest";
import { load } from "cheerio";
import { ensureCorrectLocalePrefixesInHtmlLinks } from "../src/middleware";

/**
 * Runs the middleware on a page with a single link and returns the link's
 * resulting href.
 */
const prefixedHref = (href: string, locale = "es") => {
  const html = ensureCorrectLocalePrefixesInHtmlLinks(
    `<html><body><a href="${href}">link</a></body></html>`,
    locale,
  );
  return load(html)("a").attr("href");
};

suite("ensureCorrectLocalePrefixesInHtmlLinks", () => {
  test("adds the locale prefix to root-relative links", () => {
    expect(prefixedHref("/reference/")).toBe("/es/reference/");
    expect(prefixedHref("/reference/p5/circle/", "zh-Hans")).toBe(
      "/zh-Hans/reference/p5/circle/",
    );
    expect(prefixedHref("/")).toBe("/es/");
  });

  test("does not add the locale prefix twice", () => {
    expect(prefixedHref("/es/reference/")).toBe("/es/reference/");
    expect(prefixedHref("/ko/reference/", "es")).toBe("/ko/reference/");
  });

  test.each([
    ["mailto:", "mailto:hello@p5js.org"],
    ["tel:", "tel:+15551234567"],
    ["../ relative", "../intro-to-glsl/"],
    ["./ relative", "./intro-to-glsl/"],
    ["#anchor", "#section"],
    ["http://", "http://example.com/page/"],
    ["https://", "https://example.com/page/"],
    ["// protocol-relative", "//example.com/page/"],
  ])("leaves %s links unchanged", (_, href) => {
    expect(prefixedHref(href)).toBe(href);
  });

  test("leaves links without an href alone", () => {
    const html = ensureCorrectLocalePrefixesInHtmlLinks(
      `<html><body><a name="top">no href</a></body></html>`,
      "es",
    );
    expect(load(html)("a").attr("href")).toBeUndefined();
  });

  test("only changes the links that need a prefix on a page with many links", () => {
    const html = ensureCorrectLocalePrefixesInHtmlLinks(
      `<html><body>
        <a id="a" href="/examples/">examples</a>
        <a id="b" href="mailto:hello@p5js.org">email</a>
        <a id="c" href="../intro-to-glsl/">tutorial</a>
      </body></html>`,
      "ko",
    );
    const $ = load(html);
    expect($("#a").attr("href")).toBe("/ko/examples/");
    expect($("#b").attr("href")).toBe("mailto:hello@p5js.org");
    expect($("#c").attr("href")).toBe("../intro-to-glsl/");
  });
});

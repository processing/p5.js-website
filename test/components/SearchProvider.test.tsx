import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/preact";
import { afterEach, expect, it, suite, vi } from "vitest";
import SearchProvider from "@components/SearchProvider";

const uiTranslations = {
  Search: "Search",
  "No Results": "No Results",
  Reference: "Reference",
};

const responseWith = (data: unknown) =>
  ({ json: vi.fn().mockResolvedValue(data) }) as unknown as Response;

suite("SearchProvider", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    history.replaceState(null, "", "/");
  });

  it("reuses the search index for new terms", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      responseWith({
        reference: {
          "createCanvas()": {
            relativeUrl: "/reference/p5/createCanvas",
            alias: "createCanvas",
          },
          "circle()": {
            relativeUrl: "/reference/p5/circle",
            alias: "circle",
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    history.replaceState(null, "", "/search/?term=createCanvas");

    render(
      <SearchProvider currentLocale="en" uiTranslations={uiTranslations} />,
    );

    expect(
      await screen.findByRole("link", { name: "createCanvas()" }),
    ).toBeTruthy();

    const searchInput = screen.getByLabelText("Search through site content");
    fireEvent.input(searchInput, { target: { value: "circle" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(await screen.findByRole("link", { name: "circle()" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clears the old index while a new locale loads", async () => {
    let resolveSpanishResponse: (response: Response) => void = () => {};
    const spanishResponse = new Promise<Response>((resolve) => {
      resolveSpanishResponse = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        responseWith({
          reference: {
            "English result": {
              relativeUrl: "/reference/english",
              alias: "shared",
            },
          },
        }),
      )
      .mockReturnValueOnce(spanishResponse);
    vi.stubGlobal("fetch", fetchMock);
    history.replaceState(null, "", "/search/?term=shared");

    const { rerender } = render(
      <SearchProvider currentLocale="en" uiTranslations={uiTranslations} />,
    );

    expect(
      await screen.findByRole("link", { name: "English result" }),
    ).toBeTruthy();
    const firstRequestSignal = fetchMock.mock.calls[0][1]
      ?.signal as AbortSignal;

    rerender(
      <SearchProvider currentLocale="es" uiTranslations={uiTranslations} />,
    );

    await waitFor(() => expect(firstRequestSignal.aborted).toBe(true));
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "English result" })).toBeNull(),
    );

    await act(async () => {
      resolveSpanishResponse(
        responseWith({
          reference: {
            "Spanish result": {
              relativeUrl: "/reference/spanish",
              alias: "shared",
            },
          },
        }),
      );
    });

    const spanishResult = await screen.findByRole("link", {
      name: "Spanish result",
    });
    expect(spanishResult.getAttribute("href")).toBe("/es/reference/spanish");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

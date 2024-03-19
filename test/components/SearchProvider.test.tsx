import {
  describe,
  it,
  expect,
  afterEach,
  suite,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { render, screen, act } from "@testing-library/preact";
import SearchProvider from "@components/SearchProvider";

// Setup fetch mock so that we can test the search results rendering
beforeEach(() => {
  // @ts-expect-error - fetch is a global object with a different signature
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockFetchData),
    }),
  ) as MockedFunction<typeof fetch>;
});

afterEach(() => {
  vi.restoreAllMocks(); // Reset mocks to clean state after each test
});

// Mock the data that would be returned from the search indices
const mockFetchData = {
  TEST: [
    {
      id: 1,
      title: "Test Title",
      relativeUrl: "/test-url",
      description: "Test Description",
    },
  ],
};

suite("SearchProvider", () => {
  describe("search and rendering", () => {
    it("initially shows no results and no search term", async () => {
      render(<SearchProvider currentLocale="en" />);
      expect(screen.queryByText("Search Results for:")).toBeNull();
    });

    it("updates search results on search term change", async () => {
      // Update the URL to change the search term
      window.history.pushState({}, "", "?term=Test");

      act(() => {
        render(<SearchProvider currentLocale="en" />);
      });

      const header = expect(
        await screen.findByText("Search Results for: Test"),
      );

      // Wait for the fetch to be called, and the results to be rendered
      // This can be improved later by using vi.waitFor with an async
      // dom query
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(header).not.toBeNull();
      const titleElement = screen.getByText("Test Title");
      expect(titleElement).not.toBeNull();

      const linkElement = titleElement.closest("a");
      expect(linkElement).not.toBeNull();
      expect(linkElement?.getAttribute("href")).toBe("/test-url");
    });

    it('displays "No results found" when there are no matches', async () => {
      // @ts-expect-error - TS doesn't know about vi's mockResolvedValueOnce
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({}), // Mock an empty response
      });
      // Update the URL to change the search term
      window.history.pushState({}, "", "?term=NoMatch");

      act(() => {
        render(<SearchProvider currentLocale="en" />);
      });

      expect(await screen.findByText("No results found")).not.toBeNull();
    });
  });
});

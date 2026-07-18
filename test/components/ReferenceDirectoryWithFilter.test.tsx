import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { expect, it, suite } from "vitest";
import { ReferenceDirectoryWithFilter } from "@components/ReferenceDirectoryWithFilter";

suite("ReferenceDirectoryWithFilter", () => {
  it("filters by title and description, case-insensitively", () => {
    render(
      <ReferenceDirectoryWithFilter
        categoryData={[
          {
            name: "p5.MediaElement",
            subcats: [
              {
                name: "video",
                entries: [
                  {
                    id: "1",
                    slug: "createVideo",
                    body: "",
                    collection: "reference",
                    data: {
                      path: "p5/createVideo",
                      title: "createVideo()",
                      description: "<p>Loads and plays a video element.</p>",
                    },
                  },
                ],
              },
              {
                name: "audio",
                entries: [
                  {
                    id: "2",
                    slug: "volume",
                    body: "",
                    collection: "reference",
                    data: {
                      path: "p5/volume",
                      title: "volume()",
                      description: "<p>Controls the media volume for video playback.</p>",
                    },
                  },
                ],
              },
            ],
          },
          {
            name: "p5.Graphics",
            subcats: [
              {
                name: "misc",
                entries: [
                  {
                    id: "3",
                    slug: "alpha",
                    body: "",
                    collection: "reference",
                    data: {
                      path: "p5/alpha",
                      title: "alpha()",
                      description: "<p>No matching term here.</p>",
                    },
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    const searchInput = screen.getByLabelText("Search references");

    expect(screen.getByText("p5.MediaElement")).toBeTruthy();
    expect(screen.getByText("p5.Graphics")).toBeTruthy();
    expect(screen.getByText("video")).toBeTruthy();
    expect(screen.getByText("audio")).toBeTruthy();

    fireEvent.input(searchInput, { target: { value: "VIDEO" } });

    expect(screen.getByText("p5.MediaElement")).toBeTruthy();
    expect(screen.queryByText("p5.Graphics")).toBeNull();
    expect(screen.getByText("video")).toBeTruthy();
    expect(screen.getByText("audio")).toBeTruthy();
    expect(screen.getByText("createVideo()")).toBeTruthy();
    expect(screen.getByText("volume()")).toBeTruthy();
    expect(screen.queryByText("alpha()")).toBeNull();

    cleanup();
  });
});
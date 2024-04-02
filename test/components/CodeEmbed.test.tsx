import {
  it,
  expect,
  suite,
  assert,
  afterAll,
  afterEach,
  beforeAll,
} from "vitest";
import { render, screen, act, cleanup, within } from "@testing-library/preact";
import { server } from "../mocks/server";
import { CodeEmbed } from "@/src/components/CodeEmbed";

suite("CodeEmbed", () => {
  // Start a mock server to intercept network requests
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("can create a p5 canvas", async () => {
    act(() => {
      render(
        <CodeEmbed
          initialValue={`function setup() {createCanvas(100,100);}`}
          previewable={true}
          editable={false}
        />,
      );
    });
    const frame = screen.queryByTitle("Code Preview");

    assert(frame !== null); // for type narrowing
    expect(within(frame).findByLabelText("Canvas Description")).toBeTruthy();

    cleanup();
  });
  it("can run a p5.dom method", async () => {
    act(() => {
      render(
        <CodeEmbed
          initialValue={`
        function setup() {
          let h5 = createElement('h5', 'p5*js');
          h5.style('color', 'deeppink');
          h5.position(30, 15);
        }
        `}
          previewable={true}
          editable={false}
        />,
      );
    });
    const frame = screen.queryByTitle("Code Preview");

    assert(frame !== null); // for type narrowing
    expect(within(frame).findByText("p5*js")).toBeTruthy();

    cleanup();
  });
});

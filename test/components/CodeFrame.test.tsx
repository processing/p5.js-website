import { it, expect, suite, assert } from "vitest";
import { render, screen, act, cleanup, within } from "@testing-library/preact";
import { CodeFrame } from "@components/CodeEmbed/frame";

suite("CodeFrame", () => {
  it("defaults to empty DOM", async () => {
    act(() => {
      render(<CodeFrame jsCode="" />);
    });
    const frame = screen.queryByTitle("Code Preview");
    expect(frame).not.toBeNull();
    expect(frame?.textContent).toBeFalsy();

    cleanup();
  });
  it("executes js in iframe", async () => {
    act(() => {
      render(
        <CodeFrame
          jsCode="(() => {let p = document.createElement('p'); p.textContent = 'inside-the-frame'; document.body.append(p);})();
        "
        />,
      );
    });
    const frame = screen.queryByTitle("Code Preview");

    expect(frame).not.toBeNull();
    assert(frame !== null); // for type narrowing
    expect(within(frame).findByText("inside-the-frame")).toBeTruthy();

    cleanup();
  });
});

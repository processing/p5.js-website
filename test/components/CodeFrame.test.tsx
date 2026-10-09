import { it, expect, suite, assert, vi } from "vitest";
import {
  render,
  screen,
  act,
  cleanup,
  waitFor,
  within,
} from "@testing-library/preact";
import { CodeFrame } from "@components/CodeEmbed/frame";
import { cdnLibraryUrl } from "@/src/globals/globals";

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

  it("only sends the p5 script to its own iframe origin", async () => {
    const postMessage = vi.fn();
    const contentWindowSpy = vi
      .spyOn(HTMLIFrameElement.prototype, "contentWindow", "get")
      .mockReturnValue({ postMessage } as unknown as Window);
    class ImmediateIntersectionObserver {
      private callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe() {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }

      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", ImmediateIntersectionObserver);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ text: () => Promise.resolve("p5 source") }),
    );
    const p5Script = document.createElement("script");
    p5Script.id = "p5ScriptTag";
    p5Script.src = "/p5.min.js";
    document.body.appendChild(p5Script);

    try {
      act(() => {
        render(<CodeFrame jsCode="function setup() {}" />);
      });

      const frame = screen.getByTitle("Code Preview") as HTMLIFrameElement;

      await waitFor(() =>
        expect(postMessage).toHaveBeenCalledWith(
          {
            sender: cdnLibraryUrl,
            message: "p5 source",
          },
          window.location.origin,
        ),
      );
      expect(frame.srcdoc).toContain(
        `if (event.origin !== '${window.location.origin}') return;`,
      );
      expect(frame.srcdoc).toContain(
        "if (event.source !== window.parent) return;",
      );
    } finally {
      cleanup();
      p5Script.remove();
      contentWindowSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

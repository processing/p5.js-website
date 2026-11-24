import { assert, expect, it, suite, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/preact";
import { JumpToLinks } from "@/src/components/Nav/JumpToLinks";

suite("JumpToLinks", () => {
  it("shows the shortcut and exposes it to assistive technology", () => {
    const platformSpy = vi
      .spyOn(window.navigator, "platform", "get")
      .mockReturnValue("Win32");

    act(() => {
      render(
        <JumpToLinks
          links={[{ label: "Introduction", url: "#introduction" }]}
          heading="Jump To"
          isOpen={false}
          handleToggle={vi.fn()}
        />,
      );
    });

    const shortcutLabel = screen.queryByText("Alt + J");
    const toggleButton = screen.queryByRole("button", {
      name: "Jump To menu toggle",
    });

    expect(shortcutLabel).not.toBeNull();
    expect(toggleButton).not.toBeNull();

    assert(toggleButton !== null);
    expect(toggleButton.getAttribute("aria-keyshortcuts")).toBe("Alt+J");

    platformSpy.mockRestore();
    cleanup();
  });

  it("focuses the toggle without activating it when Alt + J is pressed", () => {
    const handleToggle = vi.fn();

    act(() => {
      render(
        <JumpToLinks
          links={[{ label: "Introduction", url: "#introduction" }]}
          heading="Jump To"
          isOpen={false}
          handleToggle={handleToggle}
        />,
      );
    });

    const toggleButton = screen.queryByRole("button", {
      name: "Jump To menu toggle",
    });

    assert(toggleButton !== null);

    act(() => {
      fireEvent.keyDown(document.body, {
        key: "j",
        code: "KeyJ",
        altKey: true,
      });
    });

    expect(document.activeElement).toBe(toggleButton);
    expect(handleToggle).not.toHaveBeenCalled();

    cleanup();
  });

  it("shows Option + J on macOS and handles the delta key fallback", async () => {
    const platformSpy = vi
      .spyOn(window.navigator, "platform", "get")
      .mockReturnValue("MacIntel");

    act(() => {
      render(
        <JumpToLinks
          links={[{ label: "Introduction", url: "#introduction" }]}
          heading="Jump To"
          isOpen={false}
          handleToggle={vi.fn()}
        />,
      );
    });

    const shortcutLabel = await screen.findByText("Option + J");
    const toggleButton = screen.queryByRole("button", {
      name: "Jump To menu toggle",
    });

    expect(shortcutLabel).not.toBeNull();
    assert(toggleButton !== null);

    act(() => {
      fireEvent.keyDown(document.body, {
        key: "∆",
        code: "Unidentified",
        altKey: true,
      });
    });

    expect(document.activeElement).toBe(toggleButton);

    cleanup();
    platformSpy.mockRestore();
  });

  it.each([
    {
      name: "input",
      editableElement: <input data-testid="editable-target" />,
    },
    {
      name: "textarea",
      editableElement: <textarea data-testid="editable-target" />,
    },
    {
      name: "select",
      editableElement: <select data-testid="editable-target" />,
    },
    {
      name: "contenteditable",
      editableElement: (
        <div data-testid="editable-target" contentEditable={true}>
          Editable text
        </div>
      ),
    },
    {
      name: "nested CodeMirror element",
      editableElement: (
        <div class="cm-editor">
          <span data-testid="editable-target">Editor content</span>
        </div>
      ),
    },
  ])("ignores Alt + J from $name", ({ name, editableElement }) => {
    act(() => {
      render(
        <>
          <JumpToLinks
            links={[{ label: "Introduction", url: "#introduction" }]}
            heading="Jump To"
            isOpen={false}
            handleToggle={vi.fn()}
          />
          <button>Focus sentinel</button>
          {editableElement}
        </>,
      );
    });

    const toggleButton = screen.queryByRole("button", {
      name: "Jump To menu toggle",
    });
    const focusSentinel = screen.queryByRole("button", {
      name: "Focus sentinel",
    });
    const editableTarget = screen.queryByTestId("editable-target");

    assert(toggleButton !== null);
    assert(focusSentinel !== null);
    assert(editableTarget !== null);

    if (name === "contenteditable") {
      Object.defineProperty(editableTarget, "isContentEditable", {
        configurable: true,
        value: true,
      });
    }

    focusSentinel.focus();

    act(() => {
      fireEvent.keyDown(editableTarget, {
        key: "j",
        code: "KeyJ",
        altKey: true,
      });
    });

    expect(document.activeElement).toBe(focusSentinel);
    expect(document.activeElement).not.toBe(toggleButton);

    cleanup();
  });

  it.each([
    {
      name: "J without Alt",
      keyboardEvent: {
        key: "j",
        code: "KeyJ",
        altKey: false,
      },
    },
    {
      name: "Ctrl + Alt + J",
      keyboardEvent: {
        key: "j",
        code: "KeyJ",
        altKey: true,
        ctrlKey: true,
      },
    },
    {
      name: "Meta + Alt + J",
      keyboardEvent: {
        key: "j",
        code: "KeyJ",
        altKey: true,
        metaKey: true,
      },
    },
    {
      name: "Shift + Alt + J",
      keyboardEvent: {
        key: "J",
        code: "KeyJ",
        altKey: true,
        shiftKey: true,
      },
    },
    {
      name: "Alt + a different key",
      keyboardEvent: {
        key: "k",
        code: "KeyK",
        altKey: true,
      },
    },
  ])("ignores $name", ({ keyboardEvent }) => {
    act(() => {
      render(
        <>
          <JumpToLinks
            links={[{ label: "Introduction", url: "#introduction" }]}
            heading="Jump To"
            isOpen={false}
            handleToggle={vi.fn()}
          />
          <button>Focus sentinel</button>
        </>,
      );
    });

    const toggleButton = screen.queryByRole("button", {
      name: "Jump To menu toggle",
    });
    const focusSentinel = screen.queryByRole("button", {
      name: "Focus sentinel",
    });

    assert(toggleButton !== null);
    assert(focusSentinel !== null);

    focusSentinel.focus();

    act(() => {
      fireEvent.keyDown(focusSentinel, keyboardEvent);
    });

    expect(document.activeElement).toBe(focusSentinel);
    expect(document.activeElement).not.toBe(toggleButton);

    cleanup();
  });

  it("removes the document keydown listener when unmounted", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    let renderResult: ReturnType<typeof render>;

    act(() => {
      renderResult = render(
        <JumpToLinks
          links={[{ label: "Introduction", url: "#introduction" }]}
          heading="Jump To"
          isOpen={false}
          handleToggle={vi.fn()}
        />,
      );
    });

    const keydownRegistration = addEventListenerSpy.mock.calls.find(
      ([eventType]) => eventType === "keydown",
    );

    assert(keydownRegistration !== undefined);

    const registeredHandler = keydownRegistration[1];

    act(() => {
      renderResult.unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      registeredHandler,
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    cleanup();
  });
});

import type { JSX } from "preact";

type CircleButtonProps = {
  onClick?: (ev: MouseEvent) => void;
  ariaLabel: string;
  children: Element | JSX.Element;
  class?: string;
  href?: string;
};

export const CircleButton = ({
  onClick,
  ariaLabel,
  children,
  href,
  class: customClass = "",
}: CircleButtonProps) => {
  const sharedClass = `circle-button grid place-items-center w-[40px] h-[40px] rounded-full p-xs hover:border-type-white text-black hover:!bg-bg-black hover:text-type-white ${customClass}`;
  if (href) {
    return (
      <a
        onClick={onClick}
        aria-label={ariaLabel}
        href={href}
        class={sharedClass}
      >
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} aria-label={ariaLabel} class={sharedClass}>
      {children}
    </button>
  );
};

export default CircleButton;

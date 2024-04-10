import type { JSX } from "preact";

type CircleButtonProps = {
  onClick?: (ev: MouseEvent) => void;
  ariaLabel: string;
  children: Element | JSX.Element;
  className?: string;
};

export const CircleButton = ({
  onClick,
  ariaLabel,
  children,
  className = "",
}: CircleButtonProps) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`rounded-full bg-bg-white p-xs hover:border-type-white hover:!bg-bg-black hover:text-type-white hover:outline ${className}`}
  >
    {children}
  </button>
);

export default CircleButton;

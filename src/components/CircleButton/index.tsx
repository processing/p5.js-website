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
    className={`rounded-full bg-bg-white p-xs ${className}`}
  >
    {children}
  </button>
);

export default CircleButton;

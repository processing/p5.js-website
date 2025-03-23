import type { JSX } from "preact";

type CircleButtonProps = {
  onClick?: (ev: MouseEvent) => void;
  ariaLabel: string;
  children: Element | JSX.Element;
  className?: string;
  href?: string;
};

export const CircleButton = ({
  onClick,
  ariaLabel,
  children,
  href,
  className = "",
}: CircleButtonProps) => {
  const sharedClassName = `circle-button grid place-items-center w-[40px] h-[40px] rounded-full p-xs hover:border-type-white text-black hover:!bg-bg-black hover:text-type-white ${className}`;
  if (href) {
    return (
      <a
        onClick={onClick}
        aria-label={ariaLabel}
        href={href}
        className={sharedClassName}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={sharedClassName}
    >
      {children}
    </button>
  );
};

export default CircleButton;

type CircleButtonProps = {
  onClick?: (ev: MouseEvent) => void;
  ariaLabel: string;
  children: Element | JSX.Element | JSX.Element[] | string | null | undefined;
};

export const CircleButton = ({
  onClick,
  ariaLabel,
  children,
}: CircleButtonProps) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="rounded-full bg-bg-white p-xs"
  >
    {children}
  </button>
);

export default CircleButton;

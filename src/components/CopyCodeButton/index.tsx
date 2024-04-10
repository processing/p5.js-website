import CircleButton from "../CircleButton";

interface CopyCodeButtonProps {
  textToCopy: string;
}

export const CopyCodeButton = ({ textToCopy }: CopyCodeButtonProps) => {
  const copyTextToClipboard = () => {
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Failed to copy text: ", err);
    });
  };

  return (
    <CircleButton
      onClick={copyTextToClipboard}
      ariaLabel="Copy code to clipboard"
    >
      <svg
        width="18"
        height="22"
        viewBox="4 7 18 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M 4.054 12.141 C 4.054 11.865 4.877 11.877 5.153 11.877 L 9.073 11.953 C 9.2 11.953 8.791 22.207 9.006 23.531 C 11.73 24.182 17.631 24.022 17.631 24.171 L 17.638 28.083 C 17.638 28.359 17.414 28.583 17.138 28.583 L 4.554 28.583 C 4.278 28.583 4.054 28.359 4.054 28.083 L 4.054 12.141 Z M 5.054 12.641 L 5.054 27.583 L 16.638 27.583 L 16.735 24.024 L 8.623 24.051 L 8.195 12.679 L 5.054 12.641 Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M 8.14 8.083 C 8.14 7.807 8.364 7.583 8.64 7.583 L 21.224 7.583 C 21.5 7.583 21.724 7.807 21.724 8.083 L 21.724 24.025 C 21.724 24.301 21.5 24.525 21.224 24.525 L 8.64 24.525 C 8.364 24.525 8.14 24.301 8.14 24.025 L 8.14 8.083 Z M 9.14 8.583 L 9.14 23.525 L 20.724 23.525 L 20.724 8.583 L 9.14 8.583 Z"
          fill="currentColor"
        />
      </svg>
    </CircleButton>
  );
};

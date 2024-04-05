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
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0.66626 5.05797H13.2502V21H0.66626V5.05797Z" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.16626 5.05797C0.16626 4.78183 0.390117 4.55797 0.66626 4.55797H13.2502C13.5263 4.55797 13.7502 4.78183 13.7502 5.05797V21C13.7502 21.2761 13.5263 21.5 13.2502 21.5H0.66626C0.390117 21.5 0.16626 21.2761 0.16626 21V5.05797ZM1.16626 5.55797V20.5H12.7502V5.55797H1.16626Z"
          fill="black"
        />
        <path d="M4.75233 1H17.3363V16.942H4.75233V1Z" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.25233 1C4.25233 0.723858 4.47619 0.5 4.75233 0.5H17.3363C17.6124 0.5 17.8363 0.723858 17.8363 1V16.942C17.8363 17.2182 17.6124 17.442 17.3363 17.442H4.75233C4.47619 17.442 4.25233 17.2182 4.25233 16.942V1ZM5.25233 1.5V16.442H16.8363V1.5H5.25233Z"
          fill="black"
        />
      </svg>
    </CircleButton>
  );
};

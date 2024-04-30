import { Dropdown, type DropdownOption } from "../Dropdown";

type LocaleSelectProps = {
  options: DropdownOption[];
  locale: string;
};

export const LocaleSelect = (props: LocaleSelectProps) => {
  return (
    <Dropdown
      options={props.options}
      iconKind="globe"
      initialSelected={props.locale}
      onChange={(option: DropdownOption) => {
        if (option.id === props.locale) {
          return;
        }
        const currentUrl = new URL(window.location.href);
        currentUrl.pathname = option.value;
        window.location.href = currentUrl.href;
      }}
    />
  );
};

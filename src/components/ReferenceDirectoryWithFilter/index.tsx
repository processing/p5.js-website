import { useRef, useState } from "preact/hooks";
import { type JSX } from "preact";
import { Icon } from "../Icon";

type ReferenceDirectoryWithFilterProps = {
  uiTranslations: { [key: string]: string };
};

export const ReferenceDirectoryWithFilter = ({
  uiTranslations,
}: ReferenceDirectoryWithFilterProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setSearchKeyword("");
    }
  };

  return (
    <div>
      <div class="h-0 overflow-visible">
        <div class="content-grid-simple absolute -left-0 -right-0 -top-[60px] h-[75px] border-b border-sidebar-type-color bg-accent-color px-5 pb-lg md:px-lg">
          <div class="text-body col-span-2 flex w-full max-w-[750px] border-b border-accent-type-color text-accent-type-color">
            <input
              type="text"
              id="search"
              ref={inputRef}
              class="w-full bg-transparent py-xs text-accent-type-color placeholder:text-accent-type-color focus:outline-0"
              placeholder={uiTranslations["Filter by keyword"]}
              onKeyUp={(e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;
                setSearchKeyword(target.value);
              }}
            />
            {searchKeyword.length > 0 && (
              <button
                type="reset"
                onClick={clearInput}
                aria-label="Clear search input"
              >
                <Icon kind="close" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

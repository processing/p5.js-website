/**
 * This file is used to store global state that is shared across the application during built.
 */
export type JumpToLink = {
  label: string;
  url: string;
};

export type JumpToState = {
  heading?: string;
  links?: JumpToLink[];
};
/**
 * This object is used to store the jump to links for the current page.
 * Set to an empty object for pages without jump to links.
 */
export let jumpToState: JumpToState | null = null;

export const setJumpToState = (newJumpToState: JumpToState | null = null) => {
  jumpToState = newJumpToState;
};

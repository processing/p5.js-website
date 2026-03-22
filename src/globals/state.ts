/**
 * This file is used to store global state types that are shared across the application.
 */
export type JumpToLink = {
  label: string;
  url: string;
  size?: "small" | "medium" | "large";
  current?: boolean;
};

export type JumpToState = {
  heading?: string;
  links?: JumpToLink[];
};
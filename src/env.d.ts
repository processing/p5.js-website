/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    // We import the type directly from your state file so it knows what shape the data is
    jumpToState?: import('./globals/state').JumpToState | null;
  }
}
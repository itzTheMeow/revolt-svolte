import { writable } from "svelte/store";

export interface ContextMenuStateOption { name: string; clicked: () => any; icon?: any };
export interface ContextMenuState {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  time?: number;
  options: ContextMenuStateOption[];
}

export const CMState = writable<ContextMenuState | null>(null);

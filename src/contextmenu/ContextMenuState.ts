import { writable } from "svelte/store";

export interface ContextMenuState {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  time?: number;
  options: { name: string; clicked: () => any; icon?: any }[];
}

export const CMState = writable<ContextMenuState | null>(null);

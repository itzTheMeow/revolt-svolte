import { writable } from "svelte/store";

export interface ContextMenuStateOption {
  name: string;
  clicked: () => any;
  icon?: any;
  danger?: boolean;
}
export interface ContextMenuState {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  time?: number;
  target?: HTMLElement | EventTarget | null;
  options: ContextMenuStateOption[];
}

export const CMState = writable<ContextMenuState | null>(null);

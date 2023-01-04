import type { Member } from "revolt-toolset";
import { writable } from "svelte/store";

export interface ContextMenuStateOption {
  name: string;
  clicked: () => any;
  icon?: any;
  danger?: boolean;
}
export interface BaseContextMenuState {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  time?: number;
  target?: HTMLElement | EventTarget | null;
}
export type ContextMenuState =
  | (BaseContextMenuState & {
      type: "options";
      options: ContextMenuStateOption[];
    })
  | (BaseContextMenuState & {
      type: "member";
      member: Member;
      bar?: true;
    });

export const CMState = writable<ContextMenuState | null>(null);

import type { Member } from "revolt-toolset";
import { writable } from "svelte/store";

interface MemberMenuState {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  target?: HTMLElement | EventTarget | null;
  member: Member;
  bar?: true;
}
export const MemberMenu = writable<MemberMenuState | null>(null);

export function showMemberContext(
  member: Member,
  x: number,
  y: number,
  target?: EventTarget | HTMLElement | null
) {
  const isTop = y <= window.innerHeight / 2;
  MemberMenu.set({
    pos: {
      [isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
      left: x,
    },
    member,
    target,
  });
}

import type { Emoji, Member } from "revolt-toolset";
import { writable } from "svelte/store";

type FloatingMenuState = {
  pos: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  target?: HTMLElement | EventTarget | null;
} & ({ type: "member"; member: Member; bar?: true } | { type: "emoji"; emoji: Emoji });
export const floatingMenu = writable<FloatingMenuState | null>(null);

export function showMemberContext(
  member: Member,
  x: number,
  y: number,
  target?: EventTarget | HTMLElement | null
) {
  const isTop = y <= window.innerHeight / 2;
  floatingMenu.set({
    type: "member",
    pos: {
      [isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
      left: x,
    },
    member,
    target,
  });
}
export function showEmojiContext(
  emoji: Emoji,
  x: number,
  y: number,
  target?: EventTarget | HTMLElement | null
) {
  const isTop = y <= window.innerHeight / 2;
  floatingMenu.set({
    type: "emoji",
    pos: {
      [isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
      left: x,
    },
    emoji,
    target,
  });
}

import type { Member } from "revolt-toolset";
import { CMState } from "./ContextMenuState";

export function showMemberContext(
  member: Member,
  x: number,
  y: number,
  target?: EventTarget | HTMLElement | null
) {
  const isTop = y <= window.innerHeight / 2;
  CMState.set({
    type: "member",
    pos: {
      [isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
      left: x,
    },
    member,
    target,
  });
}

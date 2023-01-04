import type { Member } from "revolt-toolset";
import type { BaseObject } from "revolt-toolset/dist/es6/objects/BaseObject";
import { Copy, Trash } from "tabler-icons-svelte";
import { copyText } from "utils";
import { CMState, type ContextMenuStateOption } from "./ContextMenuState";

export function showOptionContext(e: MouseEvent, options: ContextMenuStateOption[]) {
  CMState.set({
    type: "options",
    pos: {
      top: e.clientY,
      left: e.clientX,
    },
    options,
  });
}
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

export function copyIDItem(item: BaseObject<any>): ContextMenuStateOption {
  return { name: "Copy ID", clicked: () => copyText(item.id), icon: Copy };
}
export function deleteItem(item: BaseObject<any> & { delete(): any }): ContextMenuStateOption {
  return { name: "Copy ID", clicked: () => item.delete(), icon: Trash, danger: true };
}

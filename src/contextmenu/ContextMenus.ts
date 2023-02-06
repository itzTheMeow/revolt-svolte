import { IconCopy, IconTrash } from "@tabler/icons-svelte";
import { ModalStack } from "modals/ModalStack";
import type { BaseObject } from "revolt-toolset/dist/es6/objects/BaseObject";
import { copyText } from "utils";
import { CMState, type ContextMenuStateOption } from "./ContextMenuState";

export function showOptionContext(e: MouseEvent, options: ContextMenuStateOption[]) {
  CMState.set({
    pos: {
      top: e.clientY,
      left: e.clientX,
    },
    options,
  });
}

export function copyIDItem(item: BaseObject<any>): ContextMenuStateOption {
  return { name: "Copy ID", clicked: () => copyText(item.id), icon: IconCopy };
}
export function deleteItem(item: BaseObject<any> & { delete(): any }): ContextMenuStateOption {
  return {
    name: "Delete",
    clicked: () => ModalStack.showDeleteModal(item),
    icon: IconTrash,
    danger: true,
  };
}

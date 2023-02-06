import {
  IconClipboard,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconLink,
  IconPhotoDown,
  IconTrash,
} from "@tabler/icons-svelte";
import { client } from "Client";
import { ModalStack } from "modals/ModalStack";
import { Attachment, Permissions, type BaseMessage } from "revolt-toolset";
import type { BaseObject } from "revolt-toolset/dist/es6/objects/BaseObject";
import { copyText, downloadFile } from "utils";
import { CMState, type ContextMenuStateOption } from "./ContextMenuState";

export function showOptionContext(
  e: MouseEvent | TouchEvent,
  options: (ContextMenuStateOption | undefined)[],
  target?: EventTarget | null
) {
  if (!options[0]) options.shift();
  const x = e instanceof TouchEvent ? e.changedTouches[0].clientX : e.clientX,
    y = e instanceof TouchEvent ? e.changedTouches[0].clientY : e.clientY,
    isRight = x >= window.innerWidth * 0.75,
    isBottom = y >= window.innerHeight * 0.75;
  CMState.set({
    pos: {
      [isBottom ? "bottom" : "top"]: isBottom ? window.innerHeight - y : y,
      [isRight ? "right" : "left"]: isRight ? window.innerWidth - x : x,
    },
    options,
    target,
  });
}

export function messageContext(message: BaseMessage) {
  const opts = [, copyIDItem(message)];

  if (message.isUser() && message.content)
    opts.splice(1, 0, {
      name: "Copy Text",
      clicked() {
        message.isUser() && copyText(message.content);
      },
      icon: IconClipboard,
    });

  if (
    (message.isUser() && message.authorID == client.user.id) ||
    (message.channel.isServerBased() && message.channel.permissions.has(Permissions.ManageMessages))
  )
    opts.unshift(deleteItem(message));

  return opts;
}
export function mediaContext(src: string | Attachment): (ContextMenuStateOption | undefined)[] {
  const term = typeof src == "string" ? "Image" : src.metadata.type,
    url = typeof src == "string" ? src : src.generateURL();

  return [
    {
      name: `Open ${term}`,
      clicked() {
        window.open(url, "_blank");
      },
      icon: IconExternalLink,
    },
    {
      name: `Save ${term}`,
      clicked() {
        downloadFile(url, typeof src == "string" ? undefined : src.name);
      },
      icon: term == "Image" ? IconPhotoDown : IconDownload,
    },
    ...(term == "Image" && navigator.clipboard?.write
      ? [
          {
            name: "Copy Image",
            async clicked() {
              navigator.clipboard.write([
                new ClipboardItem({
                  "image/png": await fetch(url).then((f) => f.blob()),
                }),
              ]);
            },
            icon: IconClipboard,
          },
          ,
        ]
      : [undefined]),
    {
      name: `Copy ${term} Link`,
      clicked() {
        copyText(url);
      },
      icon: IconLink,
    },
  ];
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

import { Channel, Server, type Message } from "revolt.js";

export function escapeHTML(txt: string) {
  return txt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
export function escapeRegex(r: RegExp) {
  return new RegExp(escapeHTML(r.source), r.flags);
}
export function proxyURL(url: string = "", type: "any" | "image") {
  return `/proxy?url=${encodeURIComponent(url)}&t=${type}`;
}

export const Matches = {
  user: /<@([A-z0-9]{26})>/g,
  channel: /<#([A-z0-9]{26})>/g,
  emojiCustom: /:([A-z0-9]{26}):/g,
  emojiDefault: /:([A-z0-9_]+?):/g,
};

export function MessageDetails(message: Message) {
  return {
    avatar: proxyURL(
      message.masquerade?.avatar
        ? message.generateMasqAvatarURL()
        : message.author?.generateAvatarURL({ max_side: 256 }) || "",
      "image"
    ),
    name:
      message.masquerade?.name ||
      message.member?.nickname ||
      message.author?.username ||
      "Unknown User",
    color:
      message.masquerade?.colour ||
      message.member?.orderedRoles.reverse().find((r) => r[1].colour)?.[1].colour,
  };
}

type NotifType = "none" | "muted" | "mention" | "all";
export interface NotificationSettings {
  server?: { [key: string]: NotifType };
  channel?: { [key: string]: NotifType };
}

export function testMuted(notifs: NotificationSettings) {
  return {
    isMuted(target: Server | Channel | undefined) {
      return target instanceof Server
        ? notifs.server?.[target._id] == "muted"
        : target instanceof Channel
        ? notifs.channel?.[target._id]
          ? notifs.channel?.[target._id] == "muted"
          : notifs.server?.[target.server_id || ""] == "muted"
        : false;
    },
  };
}

import { DateTime, Duration } from "luxon";
import type { ThemeSettings } from "revolt-toolset";
import { Channel, Member, Server, User, type Message } from "revolt-toolset";

export const BRAND_NAME =
  document.querySelector<HTMLMetaElement>(`meta[name="brand-name"]`)?.content || "Client";
export const COMMIT_HASH =
  document.querySelector<HTMLMetaElement>(`meta[name="git-hash"]`)?.content || "UNKNOWN";
export const GIT_URL = "https://github.com/itzTheMeow/revolt-svolte";
export const API_URL = "https://api.revolt.chat";

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
  return (<any>window).STANDALONE ? url : `/proxy?url=${encodeURIComponent(url)}&t=${type}`;
}

export const Matches = {
  user: /<@([A-z0-9]{26})>/g,
  channel: /<#([A-z0-9]{26})>/g,
  emojiCustom: /:([A-z0-9]{26}):/g,
  emojiDefault: /:([A-z0-9_]+?):/g,
};

export function MemberOrUserDetails(user?: User, member?: Member) {
  return {
    name: member ? MemberDetails(member).name : UserDetails(user).name,
    avatar: member ? MemberDetails(member).avatar : UserDetails(user).avatar,
    color: member ? MemberDetails(member).color : "",
  };
}
export function UserDetails(user: User | undefined) {
  return {
    online: user?.online && (!user?.presence || user.presence !== "Invisible"),
    name: user?.username || "Unknown User",
    avatar: proxyURL(user?.generateAvatarURL({ max_side: 256 }), "image"),
  };
}
export function MemberDetails(member: Member | undefined) {
  return {
    avatar: proxyURL(
      member?.avatar
        ? member.generateAvatarURL({ max_side: 256 })
        : member?.user?.generateAvatarURL({ max_side: 256 }),
      "image"
    ),
    color: member?.colorRole?.color || "",
    name: member?.nickname || UserDetails(member?.user).name,
  };
}
export function MessageDetails(message: Message) {
  const dstr = (dt: DateTime) => dt.toFormat("yyyy-LL-dd");
  const time = DateTime.fromMillis(message.createdAt);
  return {
    avatar: message.masquerade?.avatar
      ? proxyURL(message.generateMasqAvatarURL(), "image")
      : MemberOrUserDetails(message.author, message.member).avatar,
    name: message.masquerade?.name || MemberOrUserDetails(message.author, message.member).name,
    color: message.masquerade?.colour || MemberOrUserDetails(message.author, message.member).color,
    time:
      dstr(time) == dstr(DateTime.now())
        ? time.toFormat("t")
        : `${
            dstr(time) == dstr(DateTime.now().minus({ day: 1 }))
              ? "Yesterday"
              : Math.abs(time.diffNow(["days"]).days) >= 7
              ? time.toFormat("DD")
              : time.toRelative({ unit: "days" })
          } at ${time.toFormat("t")}`,
  };
}
export function UserColor(color: string) {
  return color.includes("gradient")
    ? `background:${color};background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;`
    : `color:${color};`;
}
export function StatusColor(user: User | undefined): keyof Omit<ThemeSettings, "light"> {
  if (!UserDetails(user).online) return "status-invisible";
  switch (user?.presence) {
    case "Busy":
      return "status-busy";
    case "Focus":
      return "status-focus";
    case "Idle":
      return "status-away";
    case "Online":
      return "status-online";
    default:
      return user?.online ? "status-online" : "status-invisible";
  }
}

type NotifType = "none" | "muted" | "mention" | "all";
export interface NotificationSettings {
  server?: { [key: string]: NotifType };
  channel?: { [key: string]: NotifType };
}

export function testMuted(notifs: NotificationSettings) {
  return (target: Server | Channel | undefined) => {
    return target instanceof Server
      ? notifs.server?.[target.id] == "muted"
      : target instanceof Channel
      ? notifs.channel?.[target.id]
        ? notifs.channel?.[target.id] == "muted"
        : notifs.server?.[target.isServerBased() ? target.serverID || "" : ""] == "muted"
      : false;
  };
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) await navigator.clipboard?.writeText(text);
  else {
    const i = document.createElement("input");
    document.body.appendChild(i);
    i.value = text;
    i.select();
    i.setSelectionRange(0, text.length);
    document.execCommand("copy");
    i.remove();
  }
}
export function handleUpdates(beforeUpdate: any, afterUpdate: any) {
  let pendBottom = false,
    prevScroll = 0;
  beforeUpdate(() => {
    const ListMessages = document.getElementById("MessageList");
    if (ListMessages) {
      prevScroll = ListMessages.clientHeight;
      pendBottom =
        pendBottom ||
        Math.abs(
          ListMessages.scrollTop - (ListMessages.scrollHeight - ListMessages.clientHeight)
        ) <= 2;
    }
  });
  afterUpdate(() => {
    const ListMessages = document.getElementById("MessageList");
    if (ListMessages) {
      if (pendBottom) {
        ListMessages.scrollTop = ListMessages.scrollHeight * 2;
        pendBottom = false;
      } else {
        ListMessages.scrollTop += prevScroll - ListMessages.clientHeight;
      }
    }
  });
}
export function clickoutside(
  node: HTMLElement,
  onEventFunction: (e: MouseEvent | TouchEvent) => any
) {
  const handleClick = (event: MouseEvent | TouchEvent) => {
    if (!event.composedPath().includes(node)) onEventFunction(event);
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("touchstart", handleClick);
  return {
    destroy() {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    },
  };
}

/** Format duration from seconds. */
export function formatDuration(duration: number) {
  return Duration.fromObject({
    minutes: 0,
    seconds: Math.round(duration),
  })
    .normalize()
    .toFormat("mm:ss");
}

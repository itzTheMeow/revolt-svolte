import { DateTime, Duration } from "luxon";
import {
  Channel,
  Member,
  Permissions,
  Server,
  User,
  type Message,
  type ThemeSettings,
} from "revolt-toolset";

export const BRAND_NAME =
  document.querySelector<HTMLMetaElement>(`meta[name="brand-name"]`)?.content || "Client";
export const COMMIT_HASH =
  document.querySelector<HTMLMetaElement>(`meta[name="git-hash"]`)?.content || "UNKNOWN";
export const GIT_URL = "https://github.com/itzTheMeow/revolt-svolte";
export const API_URL = "https://api.revolt.chat";

export const FULL_DATE_FORMAT = "cccc LLLL L, yyyy @ t";
export const MSG_PER_PAGE = 50;

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

export const ServerManagePermissions = [
  Permissions.AssignRoles,
  Permissions.BanMembers,
  Permissions.GrantAllSafe,
  Permissions.KickMembers,
  Permissions.ManageChannel,
  Permissions.ManageCustomisation,
  Permissions.ManageNicknames,
  Permissions.ManagePermissions,
  Permissions.ManageRole,
  Permissions.ManageServer,
  Permissions.ManageWebhooks,
  Permissions.RemoveAvatars,
  Permissions.TimeoutMembers,
];
// prettier-ignore
export const PermissionLangMap: { [key in Permissions]: [string, string] } = {
  [Permissions.AssignRoles]: ["Assign Roles", "Allows members to assign roles below their own rank to other members."],
  [Permissions.BanMembers]: ["Ban Members", "Allows members to permanently remove members from this server."],
  [Permissions.ChangeAvatar]: ["Change Avatar", "Allows members to change their server avatar on this server."],
  [Permissions.ChangeNickname]: ["Change Nickname", "Allows members to change their nickname on this server."],
  [Permissions.Connect]: ["Connect", "Allows members to connect to a voice channel."],
  [Permissions.DeafenMembers]: ["Deafen Members", "Allows members to deafen others in a voice channel."],
  [Permissions.GrantAllSafe]: ["Administrator", "All permissions."],
  [Permissions.InviteOthers]: ["Invite Others", "Allows members to invite other users to a channel."],
  [Permissions.KickMembers]: ["Kick Members", "Allows members to remove members from this server. Kicked members may rejoin with an invite."],
  [Permissions.ManageChannel]: ["Manage Channels", "Allows members to create, edit and delete channels."],
  [Permissions.ManageCustomisation]: ["Manage Customization", "Allows members to create, edit and delete emojis."],
  [Permissions.ManageMessages]: ["Manage Messages", "Allows members to delete messages sent by other members."],
  [Permissions.ManageNicknames]: ["Manage Nicknames", "Allows members to change the nicknames of other members."],
  [Permissions.ManagePermissions]: ["Manage Permissions", "Allows members to change permissions for channels and roles with a lower ranking."],
  [Permissions.ManageRole]: ["Manage Roles", "Allows members to create, edit and delete roles with a lower rank than theirs. Also allows them to modify role permissions on channels."],
  [Permissions.ManageServer]: ["Manage Server", "Allows members to change this server's name, description, icon and other related information."],
  [Permissions.ManageWebhooks]: ["Manage Webhooks", "Allows members to control webhooks in a channel."],
  [Permissions.Masquerade]: ["Masquerade", "Allows members to change their name and avatar per-message."],
  [Permissions.MoveMembers]: ["Move Members", "Allows members to move others between voice channels."],
  [Permissions.MuteMembers]: ["Mute Members", "Allows members to mute others in a voice channel."],
  [Permissions.React]: ["Use Reactions", "Allows members to react to messages."],
  [Permissions.ReadMessageHistory]: ["Read Message History", "Allows members to read the message history of this channel."],
  [Permissions.RemoveAvatars]: ["Remove Avatars", "Allows members to remove the server avatars of other members on this server."],
  [Permissions.SendEmbeds]: ["Send Embeds", "Allows members to send embedded content, whether from links or custom text embeds."],
  [Permissions.SendMessage]: ["Send Messages", "Allows members to send messages in text channels."],
  [Permissions.Speak]: ["Speak", "Allows members to speak in a voice channel."],
  [Permissions.TimeoutMembers]: ["Timeout Members", "Allows members to temporarily prevent users from interacting with the server."],
  [Permissions.UploadFiles]: ["Upload Files", "Allows members to upload files in text channels."],
  [Permissions.Video]: ["Video", "Allows members to stream video in a voice channel."],
  [Permissions.ViewChannel]: ["View Channel", "Allows members to view any channels they have this permission on."],
};

export const Matches = {
  user: /<@([A-z0-9]{26})>/g,
  channel: /<#([A-z0-9]{26})>/g,
  emojiCustom: /:([A-z0-9]{26}):/g,
  emojiDefault: /:([A-z0-9_]+?):/g,
};

export function ServerDetails(server?: Server) {
  return {
    acronym:
      server?.name
        .split(" ")
        .map((a) => a[0].toUpperCase())
        .join("") || "",
  };
}
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
    avatar: user?.generateAvatarURL({ max_side: 256 }),
  };
}
export function MemberDetails(member: Member | undefined) {
  return {
    avatar: member?.avatar
      ? member.generateAvatarURL({ max_side: 256 })
      : member?.user?.generateAvatarURL({ max_side: 256 }),
    color: member?.colorRole?.color || "",
    name: member?.nickname || UserDetails(member?.user).name,
  };
}
export function MessageDetails(message: Message) {
  const dstr = (dt: DateTime) => dt.toFormat("yyyy-LL-dd");
  const time = DateTime.fromMillis(message.createdAt);
  return {
    avatar: message.masquerade?.avatar
      ? message.generateMasqAvatarURL()
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
export async function downloadFile(src: string, filename?: string) {
  const blob = await fetch(src).then((r) => r.blob());
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || src.split("/").pop() || "file";
  a.click();
  URL.revokeObjectURL(a.href);
}
export function hasBottom(off = 2) {
  const ListMessages = document.getElementById("MessageList");
  if (!ListMessages) return false;
  return (
    Math.abs(ListMessages.scrollTop - (ListMessages.scrollHeight - ListMessages.clientHeight)) <=
    off
  );
}
export function scrollTo(pos: number | "bottom", instant = false) {
  const ListMessages = document.getElementById("MessageList");
  if (ListMessages) {
    ListMessages.scroll({
      top: pos == "bottom" ? ListMessages.scrollHeight : pos,
      behavior: instant ? "auto" : "smooth",
    });
  }
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

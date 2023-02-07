import { Tween } from "@tweenjs/tween.js";
import { client } from "Client";
import {
  Channel,
  type AutocompleteResult,
  type AutumnConfig,
  type BaseMessage,
  type Server,
} from "revolt-toolset";
import { writable } from "svelte/store";
import type { NotificationSettings } from "utils";

export const SelectionState: {
  server: string | null;
  map: Record<string, string>;
} = {
  server: null,
  ...JSON.parse(localStorage.getItem("selstate") || "{}"),
};
if (!SelectionState.map) SelectionState.map = {};
export const MembersCollapsed = writable(localStorage.getItem("collapse_mems") == "true");
MembersCollapsed.subscribe((c) => {
  localStorage.setItem("collapse_mems", String(c));
});

export const fetchedMembers = new Set<string>();
export const HomeChannel = new Channel(client, {
  _id: "0",
  channel_type: <any>"Home",
  name: "Home",
  server: "",
});

// super hacky but whatever
let went = 3;
export const ServerOrder = writable<string[]>([]);
export const SelectedServer = writable<Server | null>(0 as any);
let serverID = "";
SelectedServer.subscribe((s) => {
  if (went) went--;
  serverID = s?.id || "0";
  if (!went) {
    SelectionState.server = s?.id || null;
    const channel = client.channels.get(SelectionState.map[s?.id || "0"]);
    if (channel) SelectedChannel.set(channel);
    else if (s)
      SelectedChannel.set(s.orderedChannels.find((c) => c.channels.length)?.channels[0] || null);
    else SelectedChannel.set(s ? null : HomeChannel);
  }
  localStorage.setItem("selstate", JSON.stringify(SelectionState));

  if (!s || fetchedMembers.has(s.id)) return;
  fetchedMembers.add(s.id);
  // again shouldnt be hardcoded
  s.members
    .fetchAll(serverID == "01F7ZSBSFHQ8TA81725KQCSDDP")
    .then(() => s.id == serverID && SelectedServer.set(s));
});
export const SelectedChannel = writable<Channel | null>(null);
SelectedChannel.subscribe((c) => {
  if (went) went--;
  if (!went) {
    if (c) SelectionState.map[serverID] = c.id;
    else delete SelectionState.map[serverID];
  }
  localStorage.setItem("selstate", JSON.stringify(SelectionState));
});
export const NotifSettings = writable<NotificationSettings>({ server: {}, channel: {} });

export const MessageCache = writable<{ [key: string]: BaseMessage[] }>({});
export function pushMessages(channel: Channel, msgs: BaseMessage[]) {
  MessageCache.update((cache) => {
    cache[channel.id] = (cache[channel.id] || []).filter((c) => !msgs.find((m) => m.id == c.id));
    cache[channel.id].push(...msgs);
    cache[channel.id].sort((m1, m2) => m1.createdAt - m2.createdAt);
    return cache;
  });
}
export function spliceMessages(channel: Channel, msgs: BaseMessage[]) {
  MessageCache.update((cache) => {
    cache[channel.id] = (cache[channel.id] || []).filter((c) => !msgs.find((m) => m.id == c.id));
    cache[channel.id].sort((m1, m2) => m1.createdAt - m2.createdAt);
    return cache;
  });
}

export const uploadedFiles = writable<{ name: string; type: string; url: string; data: File }[]>(
  []
);
export function pushFile(file: File) {
  uploadedFiles.update((files) => {
    if (files.length < 5) {
      files.push({
        name: file.name,
        type: file.type.split("/")[0],
        url: URL.createObjectURL(file),
        data: file,
      });
    }
    return files;
  });
}
export const replyingTo = writable<BaseMessage[]>([]);
export function updateReplies(reply: BaseMessage, shift = false) {
  replyingTo.update((replies) => {
    const i = replies.findIndex((r) => r.id == reply.id);
    if (shift && i >= 0) replies.splice(i, 1);
    if (!shift && replies.length < 5 && i == -1) replies.push(reply);
    return replies;
  });
}
export const isEditing = writable<string | null>(null);

export const autocomplete = writable<(AutocompleteResult & { standalone: boolean }) | null>(null),
  selectedAutocomplete = writable("");
autocomplete.subscribe((a) => selectedAutocomplete.set(a?.all[0]?.id || ""));

export const MessageInputSelected = writable<boolean>(false);
let mselect = false;
MessageInputSelected.subscribe((i) => (mselect = i));
export const HoveredMessage = writable<string | null>(null);
export function addScroll(amt: number) {
  const list = document.getElementById("MessageList");
  if (list) list.scrollTop += amt;
}
export function scrolledToBottom() {
  const list = document.getElementById("MessageList");
  return !list ? 0 : list.scrollHeight - list.scrollTop - list.offsetHeight;
}

export const MobileLayout = writable<boolean>(false);
export const AppHeight = writable<number>(window.innerHeight);
export const AppWidth = writable<number>(window.innerWidth);
function recalcMobileLayout() {
  if (mselect && window.innerWidth <= 700) return;
  MobileLayout.set(window.innerWidth <= 700);
  AppHeight.set(window.innerHeight);
  AppWidth.set(window.innerWidth);
}
window.addEventListener("resize", recalcMobileLayout);
window.addEventListener("orientationchange", recalcMobileLayout);
window.addEventListener("focus", recalcMobileLayout);
recalcMobileLayout();
setInterval(recalcMobileLayout, 65);

export const CollapsedCategories = writable<string[]>([]);
{
  let setcount = 2;
  CollapsedCategories.subscribe((collapsed) => {
    if (setcount) return (setcount -= 1);
    client.syncSetSettings({ collapsed });
  });
}

export enum PaneStates {
  LEFT,
  MIDDLE,
  RIGHT,
}
export const PaneState = writable<PaneStates>(PaneStates.LEFT),
  PaneLeft = writable<number>(0);
PaneState.subscribe(updatePaneState);
export function updatePaneState(state: PaneStates, doAnimation = true) {
  const pos = (() => {
    switch (state) {
      case PaneStates.LEFT:
        return (
          document.getElementById("ChannelList")?.getBoundingClientRect().right || window.innerWidth
        );
      case PaneStates.MIDDLE:
        return 0;
      case PaneStates.RIGHT:
        return -(document.getElementById("MemberBar")?.offsetWidth || window.innerWidth);
    }
  })();
  PaneLeft.update((left) => {
    if (doAnimation)
      new Tween({ left })
        .to({ left: pos }, 200)
        .onUpdate((d) => {
          PaneLeft.set(d.left);
        })
        .onComplete(() => {
          PaneLeft.set(pos);
        })
        .start();
    return doAnimation ? left : pos;
  });
  return state;
}

export const selectInput = writable<HTMLInputElement | null>(null);
export function selectBottom(blur = false) {
  const box = document.getElementById("Textbox") as HTMLInputElement;
  if (!box) return;
  if (blur) box.blur();
  else selectInput.set(box);
}

export const fullscreenElement = writable<Element | null>(null);

let autumnFetched = false;
export const AutumnService = writable<AutumnConfig | null>(null);
export async function fetchAutumn() {
  if (autumnFetched) return;
  autumnFetched = true;
  AutumnService.set(await client.fetchAutumnConfiguration());
}

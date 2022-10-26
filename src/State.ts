import type { AutocompleteResult } from "revolt-toolset/dist/autocomplete";
import type { Channel, Message, Server } from "revolt.js";
import { writable } from "svelte/store";

export const fetchedMembers = new Set<string>();

export const SelectedServer = writable<Server | null>(null);
let serverID = "";
SelectedServer.subscribe((s) => {
  serverID = s?._id || "";
  if (!s || fetchedMembers.has(s._id)) return;
  fetchedMembers.add(s._id);
  s.fetchMembers().then(() => s._id == serverID && SelectedServer.set(s));
});
export const SelectedChannel = writable<Channel | null>(null);

let messagecachelocal: { [key: string]: Message[] } = {};
export const MessageCache = writable(messagecachelocal);
MessageCache.subscribe((d) => (messagecachelocal = d));
export function pushMessages(channel: Channel, msgs: Message[]) {
  messagecachelocal[channel._id] = (messagecachelocal[channel._id] || []).filter(
    (c) => !msgs.find((m) => m._id == c._id)
  );
  messagecachelocal[channel._id].push(...msgs);
  messagecachelocal[channel._id].sort((m1, m2) => m1.createdAt - m2.createdAt);
  MessageCache.set(messagecachelocal);
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

export const MessageInputSelected = writable<boolean>(false),
  autocomplete = writable<AutocompleteResult | null>(null);
let mselect = false;
MessageInputSelected.subscribe((i) => (mselect = i));

export const MobileLayout = writable<boolean>(false);
export const AppHeight = writable<number>(window.innerHeight);
export const AppWidth = writable<number>(window.innerWidth);
function recalcMobileLayout() {
  if (mselect) return;
  MobileLayout.set(window.innerWidth <= 700);
  AppHeight.set(window.innerHeight);
  AppWidth.set(window.innerWidth);
}
window.addEventListener("resize", recalcMobileLayout);
window.addEventListener("orientationchange", recalcMobileLayout);
window.addEventListener("focus", recalcMobileLayout);
recalcMobileLayout();
setInterval(recalcMobileLayout, 65);

export enum PaneStates {
  LEFT,
  MIDDLE,
  RIGHT,
}
export const PaneState = writable<PaneStates>(PaneStates.LEFT),
  PaneLeft = writable<number>(0);
PaneState.subscribe(updatePaneState);
export function updatePaneState(state: PaneStates) {
  switch (state) {
    case PaneStates.LEFT:
      PaneLeft.set(
        document.getElementById("ChannelList")?.getBoundingClientRect().right || window.innerWidth
      );
      break;
    case PaneStates.MIDDLE:
      PaneLeft.set(0);
      break;
    case PaneStates.RIGHT:
      PaneLeft.set(-(document.getElementById("MemberBar")?.offsetWidth || window.innerWidth));
      break;
  }
  return state;
}

export const pendBottom = writable<boolean>(false);
export const selectInput = writable<HTMLInputElement | null>(null);

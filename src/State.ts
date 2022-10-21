import type { Channel, Message, Server } from "revolt.js";
import { writable } from "svelte/store";

export const fetchedMembers = new Set<string>();

export const SelectedServer = writable<Server | null>(null);
export const SelectedChannel = writable<Channel | null>(null);

let messagecachelocal: { [key: string]: Message[] } = {};
export const MessageCache = writable(messagecachelocal);
MessageCache.subscribe(() => console.log(messagecachelocal));
export function pushMessages(channel: Channel, msgs: Message[]) {
  messagecachelocal[channel._id] = (messagecachelocal[channel._id] || []).filter(
    (c) => !msgs.find((m) => m._id == c._id)
  );
  messagecachelocal[channel._id].push(...msgs);
  messagecachelocal[channel._id].sort((m1, m2) => m1.createdAt - m2.createdAt);
  MessageCache.set(messagecachelocal);
}

export const pendBottom = writable<boolean>(false);

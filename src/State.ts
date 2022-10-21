import type { Message, Server } from "revolt.js";
import { writable } from "svelte/store";

export const fetchedMembers = new Set<string>();

export const SelectedServer = writable<Server | null>(null);

export const MessageCache = writable<{ [key: string]: Message[] }>({});

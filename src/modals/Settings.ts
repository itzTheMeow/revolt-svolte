import { writable } from "svelte/store";

export enum SettingsPage {
  Account,
}
export enum SettingsServerPage {
  Overview,
  Channels,
  Roles,
  Emojis,
  Members,
  Invites,
  Bans,
}

export const ServerSettingsChanges = writable<{ save: () => any; cancel: () => any } | null>(null);

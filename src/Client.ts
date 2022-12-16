import { observe } from "mobx";
import { DEFAULT_THEME } from "revolt-toolset";
import { Client } from "revolt.js";
import { CollapsedCategories, ServerOrder } from "State";
import { writable } from "svelte/store";
import { Theme } from "Theme";
import { NotifSettings } from "./State";

export const ClientReady = writable(false);
export const client = new Client({
  unreads: true,
});
export const UnreadState = writable(Date.now());
client.once("ready", async () => {
  try {
    const settings = await client.syncFetchSettings([]);
    console.log(settings);
    ServerOrder.set(JSON.parse(settings.ordering[1]).servers);
    NotifSettings.set(JSON.parse(settings.notifications[1]) || {});
    const theme = JSON.parse(settings.theme[1])["appearance:theme:overrides"] || {};
    Theme.set({ ...DEFAULT_THEME, ...theme });
    CollapsedCategories.set(JSON.parse(settings.collapsed?.[1] || "[]"));
    localStorage.setItem("theme", JSON.stringify(theme));
  } catch (err) {
    console.error(err);
  }
  ClientReady.set(true);
});

if (client.unreads) {
  observe((<any>client.unreads).channels, () => {
    UnreadState.set(Date.now() * Math.random());
  });
  setInterval(() => client.unreads?.sync(), 60000);
}

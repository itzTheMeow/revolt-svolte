import { Client, DEFAULT_THEME } from "revkit";
import { writable } from "svelte/store";
import {
	CollapsedCategories,
	CollapsedEmojiCategories,
	NotifSettings,
	SelectedServer,
	SelectionState,
	ServerOrder,
} from "./State";
import { Theme } from "./Theme";
import { API_URL } from "./utils";

export const ClientReady = writable(false);
export const client = ((<any>window).client = new Client({
	apiURL: API_URL,
}));
export const UnreadState = writable(Date.now());
export const UseMemberState = writable(Date.now()),
	UseUserState = writable(Date.now()),
	UseTypingState = writable(Date.now());
client.once("ready", async () => {
	try {
		const settings = await client.syncFetchSettings([]);
		ServerOrder.set(JSON.parse(settings.ordering?.[1] || "{}").servers || []);
		NotifSettings.set(JSON.parse(settings.notifications?.[1] || "{}") || {});
		const theme = JSON.parse(settings.theme?.[1] || "{}")["appearance:theme:overrides"] || {};
		Theme.set({ ...DEFAULT_THEME, ...theme });
		CollapsedCategories.set(JSON.parse(settings.collapsed?.[1] || "[]"));
		CollapsedEmojiCategories.set(JSON.parse(settings.collapsed_emojis?.[1] || "[]"));
		localStorage.setItem("theme", JSON.stringify(theme));
		SelectedServer.update(() => {
			return SelectionState.server ? client.servers.get(SelectionState.server) || null : null;
		});
	} catch (err) {
		console.error(err);
	}
	ClientReady.set(true);
});

client.unreads.onUpdate(() => {
	UnreadState.set(Date.now() * Math.random());
});
client.servers.onUpdate(() => {
	UseMemberState.set(Date.now() * Math.random());
});
setInterval(() => client.unreads.sync(), 60000);

client.on("channelStartTyping", () => UseTypingState.set(Date.now() * Math.random()));
client.on("channelStopTyping", () => UseTypingState.set(Date.now() * Math.random()));

import { Client } from "revkit";
import { writable } from "svelte/store";
import { API_URL } from "./utils";

export const ClientReady = writable(false);
export const client = ((<any>window).client = new Client({
	apiURL: API_URL,
}));
export const UnreadState = writable(Date.now());
export const UseMemberState = writable(Date.now()),
	UseUserState = writable(Date.now()),
	UseTypingState = writable(Date.now());

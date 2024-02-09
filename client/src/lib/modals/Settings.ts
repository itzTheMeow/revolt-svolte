import {
	IconGavel,
	IconIdBadge2,
	IconInfoCircle,
	IconList,
	IconMail,
	IconMoodSmile,
	IconUsers,
} from "@tabler/icons-svelte";
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

export const ServerSettingsCategories: {
	name: string;
	items: { id: SettingsServerPage; icon: ConstructorOfATypedSvelteComponent }[];
}[] = [
	{
		name: "",
		items: [
			{
				id: SettingsServerPage.Overview,
				icon: IconInfoCircle,
			},
			{ id: SettingsServerPage.Channels, icon: IconList },
			{ id: SettingsServerPage.Roles, icon: IconIdBadge2 },
		],
	},
	{
		name: "Customization",
		items: [
			{
				id: SettingsServerPage.Emojis,
				icon: IconMoodSmile,
			},
		],
	},
	{
		name: "Moderation",
		items: [
			{ id: SettingsServerPage.Members, icon: IconUsers },
			{ id: SettingsServerPage.Invites, icon: IconMail },
			{ id: SettingsServerPage.Bans, icon: IconGavel },
		],
	},
];

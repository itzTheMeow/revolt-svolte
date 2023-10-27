<script lang="ts">
	import { client } from "$lib/Client";
	import { AutumnService, MobileLayout, fetchAutumn } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { ServerDetails } from "$lib/utils";
	import { IconPlus, IconUpload, IconX } from "@tabler/icons-svelte";
	import byteSize from "byte-size";
	import Header from "extra/Header.svelte";
	import type { ExportedImageUploader } from "extra/ImageUploader";
	import ImageUploader from "extra/ImageUploader.svelte";
	import type { API, Server } from "revkit";
	import { onMount } from "svelte";
	import Input from "../../extra/Input.svelte";
	import { ModalStack } from "../ModalStack";
	import { ServerSettingsChanges } from "../Settings";

	type SysKey = keyof API.SystemMessageChannels;
	const systemKeys: SysKey[] = ["user_joined", "user_banned", "user_kicked", "user_left"],
		defaultSys: {
			[key in SysKey]: "";
		} = {
			user_banned: "",
			user_joined: "",
			user_kicked: "",
			user_left: "",
		};

	export let server: Server;
	fetchAutumn();

	let changes = {
			name: server.name,
			description: server.description,
			icon: server.icon?.id,
			banner: server.banner?.id,
			system_messages: { ...defaultSys, ...server.systemMessages },
		},
		iconUploader: ExportedImageUploader,
		bannerUploader: ExportedImageUploader;

	$: ServerSettingsChanges.set(
		changes.name !== server.name ||
			changes.description !== server.description ||
			changes.icon !== server.icon?.id ||
			changes.banner !== server.banner?.id ||
			systemKeys.map((k) => changes.system_messages[k]).join(",") !==
				systemKeys.map((k) => server.systemMessages?.[k] || "").join(",")
			? {
					save: saveChanges,
					cancel: () => {
						changes = {
							name: server.name,
							description: server.description,
							icon: server.icon?.id,
							banner: server.banner?.id,
							system_messages: { ...defaultSys, ...server.systemMessages },
						};
					},
			  }
			: null,
	);

	$: iconURL =
		changes.icon == server.icon?.id
			? server.generateIconURL({ max_side: 128 })
			: iconUploader.file
			? URL.createObjectURL(iconUploader.file)
			: "";
	$: bannerURL =
		changes.banner == server.banner?.id
			? server.generateBannerURL({ max_side: 512 })
			: bannerUploader.file
			? URL.createObjectURL(bannerUploader.file)
			: "";

	async function saveChanges() {
		const o: API.DataEditServer = {};
		if (changes.name !== server.name) o.name = changes.name;
		if (changes.description !== server.description) o.description = changes.description;
		if (!changes.icon && server.icon) o.remove = [...(o.remove || []), "Icon"];
		else if (changes.icon !== (server.icon?.id || "")) o.icon = changes.icon;
		if (!changes.banner && server.banner) o.remove = [...(o.remove || []), "Banner"];
		else if (changes.banner !== (server.banner?.id || "")) o.banner = changes.banner;
		o.system_messages = { ...changes.system_messages };
		Object.entries(o.system_messages).forEach(
			([k, v]) => !v && delete o.system_messages![<SysKey>k],
		);
		if (JSON.stringify(o.system_messages) == "{}" && server.systemMessages) {
			o.remove = [...(o.remove || []), "SystemMessages"];
			delete o.system_messages;
		} else if (
			systemKeys.map((k) => o.system_messages![k]).join(",") ==
			systemKeys.map((k) => server.systemMessages?.[k] || "").join(",")
		)
			delete o.system_messages;
		await server.edit(o);
	}

	onMount(() => {
		iconUploader.onupload(async (file) => {
			if (file) {
				if (file.size > ($AutumnService?.tags.icons.max_size || 0))
					ModalStack.push({
						type: "markdown",
						title: "File Too Large",
						content: `Your file is too large! Max size is ${byteSize(
							$AutumnService?.tags.icons.max_size || 0,
						)}.`,
					});
				else changes.icon = await client.uploadAttachment(file.name, file, "icons");
			}
		});
		bannerUploader.onupload(async (file) => {
			if (file) {
				if (file.size > ($AutumnService?.tags.banners.max_size || 0))
					ModalStack.push({
						type: "markdown",
						title: "File Too Large",
						content: `Your file is too large! Max size is ${byteSize(
							$AutumnService?.tags.banners.max_size || 0,
						)}.`,
					});
				else changes.banner = await client.uploadAttachment(file.name, file, "banners");
			}
		});
	});
</script>

<div class="flex items-center gap-4">
	<div class="flex flex-col gap-0.5 items-center w-fit relative shrink-0">
		<ImageUploader bind:uploader={iconUploader} round />
		{#if changes.icon && iconURL}
			<img src={iconURL} alt="" class="w-16 h-16 rounded-full object-cover" />
		{:else}
			<div
				class="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
				style:background={$Theme["secondary-background"]}
			>
				{ServerDetails(server).acronym}
			</div>
		{/if}
		<div
			class="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer opacity-0 w-16 h-16 rounded-full flex items-center justify-center bg-black bg-opacity-50 hover:opacity-100 transition"
			on:click={async () => {
				if (changes.icon) changes.icon = "";
				else iconUploader.trigger();
			}}
		>
			{#if changes.icon}
				<IconX size={30} />
			{:else}
				<IconUpload size={30} />
			{/if}
		</div>
		<div
			class="text-[10px] absolute top-full w-max mt-0.5"
			style:color={$Theme["tertiary-foreground"]}
		>
			MAX {byteSize($AutumnService?.tags.icons.max_size || 0)}
		</div>
	</div>
	<div class="flex flex-col flex-1">
		<Header className="ml-0.5 mb-0.5">Name</Header>
		<Input className=" {$MobileLayout ? 'flex-1' : 'max-w-xs'}" bind:value={changes.name} />
	</div>
</div>

<Header className="mt-8 ml-0.5 mb-1">Description</Header>
<Input rows={4} bind:value={changes.description} />

<Header className="mt-2 ml-0.5 mb-1">Banner</Header>
<div class="flex flex-col items-start relative w-full">
	<ImageUploader bind:uploader={bannerUploader} aspect={2} />
	{#if changes.banner && bannerURL}
		<img
			src={bannerURL}
			alt=""
			class="{$MobileLayout ? 'w-full' : 'h-48'} aspect-[2/1] max-w-full rounded object-cover"
		/>
	{:else}
		<div
			class="{$MobileLayout
				? 'w-full'
				: 'h-48'} aspect-[2/1] max-w-full rounded flex items-center justify-center"
			style:background={$Theme["secondary-background"]}
		>
			<IconPlus size={30} />
		</div>
	{/if}
	<div
		class="absolute top-0 left-0 cursor-pointer opacity-0 {$MobileLayout
			? 'w-full'
			: 'h-48'} aspect-[2/1] max-w-full rounded flex items-center justify-center bg-black bg-opacity-50 hover:opacity-100 transition"
		on:click={async () => {
			if (changes.banner) changes.banner = "";
			else bannerUploader.trigger();
		}}
	>
		{#if changes.banner}
			<IconX size={30} />
		{/if}
	</div>
	<div class="text-[10px] ml-0.5" style:color={$Theme["tertiary-foreground"]}>
		MAX {byteSize($AutumnService?.tags.banners.max_size || 0)}
	</div>
</div>

<Header className="mt-2 ml-0.5 mb-1">System Messages</Header>
<div class="flex flex-col gap-2 w-full ml-1.5">
	{#each systemKeys as sys}
		<div class="flex gap-3 items-center">
			<div class="capitalize text-lg min-w-[6em]">{sys.replace(/_/g, " ")}</div>
			<select
				class="select"
				style:background-color={$Theme["secondary-background"]}
				bind:value={changes.system_messages[sys]}
			>
				<option value="">Disabled</option>
				{#each server.orderedChannels as cat}
					<optgroup label={cat.name}>
						{#each cat.channels.filter((c) => c.isText()) as chan}
							<option value={chan.id}>{chan.name}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>
	{/each}
</div>

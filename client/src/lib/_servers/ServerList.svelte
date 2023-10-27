<script lang="ts">
	import { IconRefresh, IconSettings } from "@tabler/icons-svelte";
	import { onDestroy, onMount } from "svelte";
	import { writable } from "svelte/store";
	import { slide } from "svelte/transition";
	import { client } from "../Client";
	import { SelectedServer } from "../State";
	import { Theme } from "../Theme";
	import Indicator from "../extra/Indicator.svelte";
	import { ModalStack } from "../modals/ModalStack";
	import { SettingsPage } from "../modals/Settings";
	import { OrderedServers } from "../state/orderedServers";
	import { StatusColor } from "../utils";
	import ServerEntry from "./ServerEntry.svelte";
	import ServerIcon from "./ServerIcon.svelte";
	import ServerSeparator from "./ServerSeparator.svelte";

	let selectedDMs = false,
		list: HTMLDivElement,
		hasTop = true;
	const scrollTop = writable(0);
	$: {
		selectedDMs = !$SelectedServer;
		hasTop = $scrollTop <= 0;
	}
	let int: NodeJS.Timeout;
	onMount(() => {
		int = setInterval(() => {
			$scrollTop = list?.scrollTop || 0;
		}, 10);
	});
	onDestroy(() => {
		clearInterval(int);
	});
</script>

<div
	class="flex items-center flex-col pt-2 px-2 h-full"
	style="background-color:{$Theme['background']};"
	id="ServerList"
>
	<ServerEntry onclick={() => SelectedServer.set(null)} className="mb-1.5">
		<div class="w-12 h-12 rounded-full">
			<img
				src={client.user.generateAvatarURL({ max_side: 64 })}
				alt=""
				class="before:text-sm before:font-bold before:align-text-top before:flex before:justify-center"
			/>
		</div>
		<div
			class="absolute top-0 left-0 w-12 h-12 rounded-full hover:bg-black hover:bg-opacity-20 !overflow-visible"
			style={selectedDMs ? `border: 2px solid ${$Theme["accent"]};` : ""}
		>
			<Indicator
				pos="bottomRight"
				color={$Theme[StatusColor(client.user)]}
				bg={$Theme["background"]}
				isSelected={selectedDMs}
			/>
		</div>
	</ServerEntry>
	{#if hasTop}
		<div transition:slide|local={{ duration: 200 }} class="flex justify-center w-full">
			<ServerSeparator className="my-0.5" />
		</div>
	{/if}

	<div
		class="flex items-center flex-1 flex-col overflow-y-auto pt-1 pb-2 gap-2.5 noscr"
		style:scrollbar-width="none"
		style:--scroll-width="0px"
		bind:this={list}
	>
		{#each $OrderedServers as server (server.id)}
			<ServerIcon {server} />
		{/each}

		<ServerSeparator />

		<ServerEntry placeholder onclick={() => window.location.reload()} tooltip="Reload">
			<div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
				<IconRefresh />
			</div>
		</ServerEntry>
		<ServerEntry
			placeholder
			onclick={() => ModalStack.push({ type: "settings", page: SettingsPage.Account })}
			tooltip="Settings"
		>
			<div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
				<IconSettings />
			</div>
		</ServerEntry>
	</div>
</div>

<style>
	.noscr::-webkit-scrollbar {
		display: none;
	}
</style>

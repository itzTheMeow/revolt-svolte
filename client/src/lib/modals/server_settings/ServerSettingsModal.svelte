<script lang="ts">
	import { MobileLayout } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { IconX } from "@tabler/icons-svelte";
	import Header from "../../extra/Header.svelte";
	import ModalBase from "../ModalBase.svelte";
	import type { Modal, ModalData } from "../ModalStack";
	import { ServerSettingsCategories, SettingsServerPage } from "../Settings";
	import ServerSettingsModalOverview from "./PageOverview.svelte";
	import ServerSettingsModalButton from "./ServerSettingsModalButton.svelte";
	import ServerSettingsModalSave from "./ServerSettingsModalSave.svelte";

	export let modal: Extract<ModalData, { type: "settings_server" }>;
	let item: Modal;
</script>

<ModalBase {modal} bind:item full>
	<div
		class="flex w-full max-w-5xl mx-auto relative {$MobileLayout
			? 'flex-col-reverse gap-1'
			: 'my-8 gap-6'}"
	>
		{#if !$MobileLayout}
			<div class="w-56">
				<div class="flex flex-col gap-2 items-center sticky top-0">
					<div
						class="flex flex-col gap-1 p-6 rounded-lg w-full h-fit"
						style:background={$Theme["secondary-background"]}
					>
						<div class="text-lg font-semibold">{modal.server.name}</div>
						{#each ServerSettingsCategories as cat}
							{#if cat.name}
								<Header className="mb-1 mt-0.5">{cat.name}</Header>
							{/if}
							{#each cat.items as i}
								<ServerSettingsModalButton category={i.id} icon={i.icon} {modal} />
							{/each}
						{/each}
					</div>
					<div class="flex gap-1">
						<ServerSettingsModalSave />
					</div>
				</div>
			</div>
		{/if}
		<div class="flex-1">
			<div class="flex mb-3 gap-1 items-center {$MobileLayout ? 'mt-1' : ''}">
				{#if !$MobileLayout}
					<h1 class="mr-3">{SettingsServerPage[modal.page]}</h1>
				{:else}
					<ServerSettingsModalSave />
				{/if}
			</div>
			{#if modal.page == SettingsServerPage.Overview}
				<ServerSettingsModalOverview server={modal.server} />
			{/if}
		</div>
		<div class="relative flex gap-5 {$MobileLayout ? 'items-center' : ''}">
			{#if $MobileLayout}
				<select
					class="select flex-1"
					style:background-color={$Theme["secondary-background"]}
					bind:value={modal.page}
				>
					{#each ServerSettingsCategories as cat}
						{#if cat.name}
							<optgroup label={cat.name}>
								{#each cat.items as i}
									<option value={i.id}>{SettingsServerPage[i.id]}</option>
								{/each}
							</optgroup>
						{:else}
							{#each cat.items as i}
								<option value={i.id}>{SettingsServerPage[i.id]}</option>
							{/each}
						{/if}
					{/each}
				</select>
			{/if}
			<div
				class="rounded-full p-2 cursor-pointer h-fit w-fit"
				style:border="{$MobileLayout ? 2 : 3}px solid {$Theme["tertiary-background"]}"
				on:click={() => item.close()}
			>
				<IconX size={20} />
			</div>
		</div>
	</div>
</ModalBase>

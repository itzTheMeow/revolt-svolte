<script lang="ts">
	import {
		AppWidth,
		HomeChannel as Home,
		MobileLayout,
		PaneLeft,
		PaneState,
		PaneStates,
		SelectedChannel,
		updatePaneState,
	} from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { onMount } from "svelte";
	import HomeChannel from "./HomeChannel.svelte";
	import TextChannel from "./TextChannel.svelte";
	import VoiceChannel from "./VoiceChannel.svelte";

	onMount(() => {
		updatePaneState($PaneState, false);
	});
</script>

<div
	class="h-full overflow-hidden flex flex-col {$MobileLayout ? 'absolute top-0' : 'flex-1 min-w-0'}"
	style="background-color:{$Theme['primary-background']};{$MobileLayout
		? `left:${$PaneLeft}px;width:${$AppWidth}px;`
		: ''}"
	id="Pane"
	on:touchstart={(e) => {
		if ($MobileLayout && $PaneState !== PaneStates.MIDDLE) {
			e.preventDefault();
			return false;
		}
	}}
>
	{#if $SelectedChannel}
		{#if $SelectedChannel.isTextBased()}
			<TextChannel channel={$SelectedChannel} />
		{:else if $SelectedChannel.isVoice()}
			<VoiceChannel channel={$SelectedChannel} />
		{:else if $SelectedChannel.id == Home.id}
			<HomeChannel />
		{/if}
	{:else}
		Select a channel!
	{/if}
</div>

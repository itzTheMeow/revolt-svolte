<script lang="ts">
	import { UseTypingState } from "$lib/Client";
	import {
		ChannelTops,
		MembersCollapsed,
		MessageState,
		MobileLayout,
		SelectedChannel,
	} from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { MSG_PER_PAGE } from "$lib/utils";
	import {
		IconLayoutSidebarRightCollapse,
		IconLayoutSidebarRightExpand,
	} from "@tabler/icons-svelte";
	import Loader from "Loader.svelte";
	import ChannelIcon from "channels/ChannelIcon.svelte";
	import { channelContext, showOptionContext } from "contextmenu/ContextMenus";
	import Markdown from "markdown/Markdown.svelte";
	import { ModalStack } from "modals/ModalStack";
	import type { BaseMessage, Channel } from "revkit";
	import { tick } from "svelte";
	import VirtualScroll from "svelte-virtual-scroll-list";
	import MessageItem from "./MessageItem.svelte";
	import Textbox from "./Textbox.svelte";

	export let channel: Channel;

	const barHeight = 40;
	let offsetHeight = 0,
		list: VirtualScroll;

	let messages: BaseMessage[] = [];
	$: {
		$MessageState;
		// reverse so newest is first
		messages = channel.messages.ordered.reverse();
	}

	let MessageList: HTMLDivElement,
		fetching: 1 | 0 | -1 = 0;

	async function fetchMessages(from: "top" | "bottom") {
		if (fetching) return;
		fetching = from == "top" ? 1 : -1;

		const first = from == "top" ? messages[messages.length - 1] : messages[0];
		const fetched = await channel.messages.fetchMultiple({
			limit: MSG_PER_PAGE,
			include_users: true,
			...(first ? { [from == "top" ? "before" : "after"]: first.id } : {}),
		});
		if (!fetched.length && from == "top") ChannelTops[channel.id] = first.id;
		if (!fetched.length && from == "bottom") channel.update({ last_message_id: first.id });

		if (top) {
			// to save position on adding items to top we need to calculate
			// new top offset based on added items
			//
			// it works ONLY if newly added items was rendered
			tick().then(() => {
				const sids = fetched.map((m) => m.id);
				const offset = sids.reduce(
					(previousValue, currentSid) => previousValue + list.getSize(<any>currentSid),
					0,
				);
				list.scrollToOffset(offset);
			});
		} else {
			// timeout needs because sometimes when you scroll down `scroll` event fires twice
			// and changes list.virtual.direction from BEHIND to FRONT
			// maybe there is a better solution
			setTimeout(() => list.scrollToOffset(list.getOffset() + 1), 3);
		}
		fetching = 0;
	}
</script>

<div
	class="flex items-center px-3 {channel.description ? 'cursor-pointer' : ''}"
	style:background={$Theme["secondary-background"]}
	style:height="{barHeight}px"
	on:click={() =>
		channel.description &&
		ModalStack.push({
			type: "markdown",
			title: channel.name,
			content: channel.description,
		})}
	on:contextmenu={(e) => showOptionContext(e, channelContext(channel))}
>
	<ChannelIcon {channel} />
	<div class="text-lg ml-1 pointer-events-none">{channel.name}</div>
	{#if channel.description}
		<div class="text-lg opacity-30 ml-2 pointer-events-none">&bull;</div>
		<div class="mx-2 text-sm flex-1 overflow-hidden pointer-events-none">
			<Markdown text={channel.description} line />
		</div>
	{/if}
	{#if !$MobileLayout}
		<div
			class="ml-auto hover:brightness-75 cursor-pointer"
			on:click={() => ($MembersCollapsed = !$MembersCollapsed)}
			style:color={$Theme["secondary-foreground"]}
		>
			{#if $MembersCollapsed}
				<IconLayoutSidebarRightExpand size={20} />
			{:else}
				<IconLayoutSidebarRightCollapse size={20} />
			{/if}
		</div>
	{/if}
</div>
<div
	class="overflow-y-auto flex-1 p-1.5 pb-1 flex flex-col-reverse {fetching !== 1 ? 'pt-8' : ''}"
	style:padding-bottom={$UseTypingState && $SelectedChannel?.typing?.length ? "" : "1.75rem"}
	id="MessageList"
	bind:this={MessageList}
	bind:offsetHeight
>
	<VirtualScroll
		data={messages}
		bind:this={list}
		on:bottom={() => fetchMessages("bottom")}
		on:top={() => fetchMessages("top")}
		let:data
	>
		<svelte:fragment slot="header">
			{#if fetching == -1}
				<div class="w-full flex items-center justify-center h-8">
					<Loader size={24} />
				</div>
			{/if}
		</svelte:fragment>
		<div class="flex flex-col-reverse">
			{#each data as message (message.id)}
				<MessageItem {message} />
			{/each}
		</div>
		<svelte:fragment slot="footer">
			{#if fetching == 1}
				<div class="w-full flex items-center justify-center h-8">
					<Loader size={24} />
				</div>
			{/if}
		</svelte:fragment>
	</VirtualScroll>
</div>
<Textbox />

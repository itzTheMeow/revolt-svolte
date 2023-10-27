<script lang="ts">
	import { client } from "$lib/Client";
	import { MessageState, MobileLayout, isEditing, selectBottom, updateReplies } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { ZIndexes } from "$lib/utils";
	import { IconCornerUpLeft, IconDots, IconPencil, IconTrash } from "@tabler/icons-svelte";
	import { messageContext, showOptionContext } from "contextmenu/ContextMenus";
	import { ModalStack } from "modals/ModalStack";
	import { BaseMessage, Permissions } from "revkit";
	import MessageItemToolbarItem from "./MessageItemToolbarItem.svelte";

	export let message: BaseMessage;
</script>

<div
	class="absolute {$MobileLayout
		? '-top-6 right-5 h-12'
		: '-top-4 right-3 h-8'} flex rounded-lg overflow-hidden"
	data-hover-item
	style:background={$Theme["primary-header"]}
	style:z-index={ZIndexes.Toolbar}
>
	<MessageItemToolbarItem
		icon={IconCornerUpLeft}
		on:anyclick={() => {
			updateReplies(message);
			selectBottom();
		}}
		title="Reply"
	/>
	{#if message.isUser() && message.authorID == client.user?.id}
		<MessageItemToolbarItem
			icon={IconPencil}
			on:anyclick={() => isEditing.set(message.id)}
			title="Edit"
		/>
	{/if}
	{#if message.channel?.permissions.has(Permissions.ManageMessages) || (message.isUser() && message.authorID == client.user?.id)}
		<MessageItemToolbarItem
			icon={IconTrash}
			on:click={() => ModalStack.showDeleteModal(message)}
			on:shiftclick={() => {
				if (!message.channel) return;
				message.delete();
				MessageState.set(Date.now());
			}}
			style="color:{$Theme['error']};"
			title="Delete"
		/>
	{/if}
	<MessageItemToolbarItem
		icon={IconDots}
		on:anyclick={(e) => showOptionContext(e.detail, messageContext(message), e.detail.target)}
		title="More"
	/>
</div>

<script lang="ts">
	import { UseMemberState } from "$lib/Client";
	import FloatingEmojiMenu from "./FloatingEmojiMenu.svelte";
	import FloatingEmojiPicker from "./FloatingEmojiPicker.svelte";
	import FloatingMemberMenu from "./FloatingMemberMenu.svelte";
	import { floatingMenu } from "./FloatingMenu";
</script>

{#if $floatingMenu}
	{#if $floatingMenu.type == "member"}
		{#key $UseMemberState}
			<FloatingMemberMenu member={$floatingMenu.member} />
		{/key}
	{:else if $floatingMenu.type == "emoji_picker"}
		<FloatingEmojiPicker cursorPos={$floatingMenu.cursor} targetInput={$floatingMenu.input} />
	{:else if $floatingMenu.type == "emoji"}
		<FloatingEmojiMenu emoji={$floatingMenu.emoji} />
	{/if}
{/if}

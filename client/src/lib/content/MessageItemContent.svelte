<script lang="ts">
	import { isEditing } from "$lib/State";
	import type { Message } from "revkit";
	import Markdown from "../markdown/Markdown.svelte";
	import Textbox from "./Textbox.svelte";

	export let message: Message;
</script>

{#if $isEditing == message.id}
	<Textbox standalone={message} className="mt-2" />
{:else}
	<Markdown text={message.content || ""} keepSpace />
{/if}

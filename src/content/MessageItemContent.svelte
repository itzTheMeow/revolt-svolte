<script lang="ts">
  import type { Message } from "revolt-toolset";
  import { isEditing } from "State";
  import Markdown from "../markdown/Markdown.svelte";
  import Textbox from "./Textbox.svelte";

  export let message: Message;
</script>

{#if $isEditing == message.id}
  <Textbox standalone={message} className="mt-2" />
{:else}
  <Markdown text={message.content || ""} keepSpace />
{/if}

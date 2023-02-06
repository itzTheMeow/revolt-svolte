<script lang="ts">
  import type { Message } from "revolt-toolset";
  import { isEditing } from "State";
  import Markdown from "../markdown/Markdown.svelte";

  export let message: Message;
</script>

{#if $isEditing == message.id}
  ok
{:else}
  <Markdown text={message.content || ""} keepSpace />
{/if}

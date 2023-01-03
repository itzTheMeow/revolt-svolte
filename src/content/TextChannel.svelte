<script lang="ts">
  import type { Channel } from "revolt-toolset";
  import { MessageCache } from "State";
  import MessageItem from "./MessageItem.svelte";
  import Textbox from "./Textbox.svelte";

  export let channel: Channel;
</script>

<div class="overflow-y-auto flex-1 flex flex-col p-1.5" id="MessageList">
  {#if $MessageCache[channel.id]?.length}
    <div class="mt-auto" />
    {#each $MessageCache[channel.id].slice(-75) as message}
      <MessageItem {message} />
    {/each}
  {:else}
    ...
  {/if}
</div>
<Textbox />

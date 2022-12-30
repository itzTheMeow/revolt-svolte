<script lang="ts">
  import type { Channel } from "revolt.js";
  import { MessageCache } from "State";
  import MessageItem from "./MessageItem.svelte";
  import Textbox from "./Textbox.svelte";

  export let channel: Channel;
</script>

<div class="overflow-y-auto flex-1 flex flex-col break-all p-1.5" id="MessageList">
  {#if $MessageCache[channel._id]?.length}
    <div class="mt-auto" />
    {#each $MessageCache[channel._id].slice(-75) as message}
      <MessageItem {message} />
    {/each}
  {:else}
    ...
  {/if}
</div>
<Textbox />

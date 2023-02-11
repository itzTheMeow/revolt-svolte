<script lang="ts">
  import { IconAt, IconAtOff, IconCircleX, IconCornerUpLeft } from "@tabler/icons-svelte";
  import Markdown from "markdown/Markdown.svelte";
  import type { BaseMessage } from "revolt-toolset";
  import { updateReplies } from "State";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";

  export let reply: [BaseMessage, boolean];
</script>

<div
  class="w-full h-5 flex items-center gap-1.5 px-3 py-4 rounded"
  style="background-color:{$Theme['primary-header']};"
>
  <IconCornerUpLeft size={18} />
  {#if reply[0].isUser()}
    <img class="rounded-full w-5 h-5" src={MessageDetails(reply[0]).avatar} alt="" />
    <div class="-ml-0.5" style="color:{MessageDetails(reply[0]).color || 'unset'};">
      {MessageDetails(reply[0]).name}
    </div>
    <div class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
      {#if reply[0].content}
        <Markdown text={reply[0].content} line />
      {:else}
        <i>Sent an Attachment</i>
      {/if}
    </div>
  {/if}
  <div
    class="ml-auto cursor-pointer hover:brightness-75"
    on:click|preventDefault={() => (reply[1] = !reply[1])}
    on:touchend|preventDefault={() => (reply[1] = !reply[1])}
  >
    {#if reply[1]}
      <IconAt size={18} color={$Theme["accent"]} />
    {:else}
      <IconAtOff size={18} color={$Theme["tertiary-foreground"]} />
    {/if}
  </div>
  <div
    class="ml-2 cursor-pointer hover:brightness-75"
    on:click|preventDefault={() => updateReplies(reply[0], true)}
    on:touchend|preventDefault={() => updateReplies(reply[0], true)}
  >
    <IconCircleX size={20} color={$Theme["secondary-foreground"]} />
  </div>
</div>

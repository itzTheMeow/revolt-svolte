<script lang="ts">
  import type { BaseMessage } from "revolt-toolset";
  import { updateReplies } from "State";
  import { CircleX, CornerUpLeft } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { MessageDetails } from "utils";

  export let message: BaseMessage;
  let ReplyBox: HTMLDivElement;

  function delReply(e: Event) {
    e.preventDefault();
    updateReplies(message, true);
  }
</script>

<div
  class="w-full h-5 flex items-center gap-1.5 px-3 py-4 rounded"
  style="background-color:{$Theme['primary-header']};"
  bind:this={ReplyBox}
>
  <CornerUpLeft size={18} />
  {#if message.isUser()}
    <img class="rounded-full w-5 h-5" src={MessageDetails(message).avatar} alt="" />
    <div class="-ml-0.5" style="color:{MessageDetails(message).color || 'unset'};">
      {MessageDetails(message).name}
    </div>
    <div class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
      {#if message.content}
        {message.content.slice(0, 200)}
      {:else}
        <i>Sent an Attachment</i>
      {/if}
    </div>
  {/if}
  <div
    class="ml-auto cursor-pointer hover:brightness-75"
    on:click={delReply}
    on:touchend={delReply}
  >
    <CircleX size={18} />
  </div>
</div>

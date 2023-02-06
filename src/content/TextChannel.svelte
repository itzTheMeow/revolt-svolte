<script lang="ts">
  import ChannelIcon from "channels/ChannelIcon.svelte";
  import { UseTypingState } from "Client";
  import Markdown from "markdown/Markdown.svelte";
  import type { Channel } from "revolt-toolset";
  import { MessageCache, SelectedChannel } from "State";
  import { Theme } from "Theme";
  import MessageItem from "./MessageItem.svelte";
  import Textbox from "./Textbox.svelte";

  export let channel: Channel;
</script>

<div class="h-10 flex items-center px-3" style:background={$Theme["secondary-background"]}>
  <ChannelIcon {channel} />
  <div class="text-lg ml-1">{channel.name}</div>
  {#if channel.description}
    <div class="text-lg opacity-30 ml-2">&bull;</div>
    <div class="ml-2 text-sm flex-1 overflow-hidden">
      <Markdown text={channel.description} line />
    </div>
  {/if}
</div>
<div
  class="overflow-y-auto flex-1 p-1.5 pb-1 flex flex-col-reverse"
  style:padding-bottom={$UseTypingState && $SelectedChannel?.typing?.length ? "" : "1.75rem"}
  id="MessageList"
>
  <div class="flex flex-col-reverse">
    {#if $MessageCache[channel.id]?.length}
      {#each $MessageCache[channel.id].slice(-75).reverse() as message (message.id)}
        <MessageItem {message} />
      {/each}
    {:else}
      ...
    {/if}
  </div>
</div>
<Textbox />

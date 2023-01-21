<script lang="ts">
  import ChannelIcon from "channels/ChannelIcon.svelte";
  import Markdown from "markdown/Markdown.svelte";
  import type { Channel } from "revolt-toolset";
  import { MessageCache } from "State";
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
<div class="overflow-y-auto flex-1 flex flex-col p-1.5" id="MessageList">
  {#if $MessageCache[channel.id]?.length}
    <div class="mt-auto" />
    {#each $MessageCache[channel.id].slice(-75) as message (message.id)}
      <MessageItem {message} />
    {/each}
  {:else}
    ...
  {/if}
</div>
<Textbox />

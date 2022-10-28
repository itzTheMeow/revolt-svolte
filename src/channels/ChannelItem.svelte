<script lang="ts">
  import {
    MessageCache,
    MobileLayout,
    PaneState,
    PaneStates,
    pendBottom,
    pushMessages,
    selectBottom,
    SelectedChannel,
  } from "State";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import { Hash, Volume } from "tabler-icons-svelte";
  import type { Channel } from "revolt.js";

  export let channel: Channel;

  async function switchTo() {
    $SelectedChannel = channel;
    if (!$MobileLayout) selectBottom();
    pendBottom.set(true);
    PaneState.set(PaneStates.MIDDLE);
    if (!$MessageCache[$SelectedChannel._id]?.length) {
      const m = await channel.fetchMessages({
        limit: 100,
      });
      pushMessages($SelectedChannel, m);
      pendBottom.set(true);
    }
  }
</script>

<div
  class="cursor-pointer m-1.5 p-2 rounded flex items-center box-border bg-black bg-opacity-30 hover:bg-opacity-20 relative"
  on:click={switchTo}
>
  {#if channel.icon}
    <img
      src={proxyURL(channel.generateIconURL({ max_side: 64 }), "image")}
      width="20"
      height="20"
      class="object-cover aspect-square"
      alt=""
    />
  {:else if channel.channel_type == "TextChannel"}
    <Hash size={20} />
  {:else if channel.channel_type == "VoiceChannel"}
    <Volume size={20} />
  {/if}
  <span class="ml-1">{channel.name}</span>
  <div
    class="absolute top-0 left-0 w-full h-full rounded"
    style={$SelectedChannel?._id == channel._id ? `border: 1px solid ${$Theme["accent"]};` : ""}
  />
</div>

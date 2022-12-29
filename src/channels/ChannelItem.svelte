<script lang="ts">
  import { UnreadState } from "Client";
  import { CMState } from "contextmenu/ContextMenuState";
  import Indicator from "extra/Indicator.svelte";
  import type { Channel } from "revolt.js";
  import {
    MessageCache,
    MobileLayout,
    NotifSettings,
    PaneState,
    PaneStates,
    pushMessages,
    selectBottom,
    SelectedChannel,
  } from "State";
  import { Copy, Hash, Volume } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { copyText, proxyURL, testMuted } from "utils";

  export let channel: Channel;
  let isSelected = false;

  async function switchTo() {
    $SelectedChannel = channel;
    if (!$MobileLayout) selectBottom();
    PaneState.set(PaneStates.MIDDLE);
    if (!$MessageCache[$SelectedChannel._id]?.length) {
      const m = await channel.fetchMessages({
        limit: 100,
      });
      pushMessages($SelectedChannel, m);
    }
    if (channel.isUnread(testMuted($NotifSettings))) channel.ack(undefined, true);
  }

  let isUnread = false;
  let numUnreads = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedChannel?._id == channel._id;
    isUnread = !!channel.isUnread(testMuted($NotifSettings));
  }

  function contextmenu(e: MouseEvent) {
    CMState.set({
      type: "options",
      pos: {
        top: e.clientY,
        left: e.clientX,
      },
      options: [{ name: "Copy ID", clicked: () => copyText(channel._id), icon: Copy }],
    });
  }
</script>

<div
  class="cursor-pointer m-1.5 p-2 rounded flex items-center box-border bg-black bg-opacity-30 hover:bg-opacity-20 relative"
  on:click={switchTo}
  on:contextmenu={contextmenu}
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
    style={isSelected ? `border: 2px solid ${$Theme["accent"]};` : ""}
  >
    {#if isUnread}
      <Indicator
        {isSelected}
        pos="topLeft"
        bg={$Theme["secondary-background"]}
        text={numUnreads >= 100 ? "99+" : String(numUnreads || "")}
      />
    {/if}
  </div>
</div>

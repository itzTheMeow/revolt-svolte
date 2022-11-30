<script lang="ts">
  import {
    MessageCache,
    MobileLayout,
    NotifSettings,
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
  import { Channel, Server } from "revolt.js";
  import { UnreadState } from "Client";

  export let channel: Channel;
  let isSelected = false;

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

  let isUnread = false;
  let numUnreads = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedChannel?._id == channel._id;
    isUnread = !!channel.isUnread({
      isMuted(target) {
        return target instanceof Server
          ? $NotifSettings.server?.[target._id] == "muted"
          : target instanceof Channel
          ? $NotifSettings.channel?.[target._id]
            ? $NotifSettings.channel?.[target._id] == "muted"
            : $NotifSettings.server?.[target.server_id || ""] == "muted"
          : false;
      },
    });
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
    style={isSelected ? `border: 2px solid ${$Theme["accent"]};` : ""}
  >
    {#if isUnread}
      <div
        class="absolute {isSelected
          ? '-left-1 -top-1.5'
          : '-left-0.5 -top-1'} flex items-center justify-center text-xs px-1 h-5 rounded-full text-left"
        style:background-color={$Theme["secondary-foreground"]}
        style:border="3px solid {$Theme["secondary-background"]}"
        style:color={$Theme["secondary-background"]}
        style:min-width="1.25rem"
      >
        {(numUnreads >= 100 ? "99+" : numUnreads) || ""}
      </div>
    {/if}
  </div>
</div>

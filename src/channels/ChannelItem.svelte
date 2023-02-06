<script lang="ts">
  import { UnreadState } from "Client";
  import { channelContext, showOptionContext } from "contextmenu/ContextMenus";
  import Indicator from "extra/Indicator.svelte";
  import type { Channel } from "revolt-toolset";
  import {
    MobileLayout,
    NotifSettings,
    PaneState,
    PaneStates,
    selectBottom,
    SelectedChannel,
  } from "State";
  import { Theme } from "Theme";
  import { testMuted, UserDetails } from "utils";
  import ChannelIcon from "./ChannelIcon.svelte";

  export let channel: Channel;
  let isSelected = false;

  async function switchTo() {
    $SelectedChannel = channel;
    if (!$MobileLayout) selectBottom();
    PaneState.set(PaneStates.MIDDLE);
    if (channel.isTextBased()) {
      if (channel.checkUnread(testMuted($NotifSettings))) channel.ack();
    }
  }

  let isUnread = false;
  let numMentions = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedChannel?.id == channel.id;
    numMentions = channel.getMentions(testMuted($NotifSettings)).length;
    isUnread = !!channel.checkUnread(testMuted($NotifSettings)) || !!numMentions;
  }
</script>

<div
  class="cursor-pointer m-1.5 p-2 rounded flex items-center box-border bg-black bg-opacity-30 hover:bg-opacity-20 relative"
  on:click={switchTo}
  on:contextmenu={(e) => showOptionContext(e, channelContext(channel))}
>
  <ChannelIcon {channel} />
  <span class="ml-1">
    {channel.isDM() ? UserDetails(channel.recipient).name : channel.name}
  </span>
  <div
    class="absolute top-0 left-0 w-full h-full rounded"
    style={isSelected ? `border: 2px solid ${$Theme["accent"]};` : ""}
  >
    {#if isUnread}
      <Indicator
        {isSelected}
        pos="topLeft"
        bg={$Theme["secondary-background"]}
        color={numMentions ? $Theme["error"] : undefined}
        text={numMentions >= 100 ? "99+" : String(numMentions || "")}
        textColor="inherit"
      />
    {/if}
  </div>
</div>

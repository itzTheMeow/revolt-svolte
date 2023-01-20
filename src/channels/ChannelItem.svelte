<script lang="ts">
  import { IconHash, IconHome, IconNotebook, IconUsers, IconVolume } from "@tabler/icons-svelte";
  import { UnreadState } from "Client";
  import { copyIDItem, showOptionContext } from "contextmenu/ContextMenus";
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
  import { proxyURL, testMuted, UserDetails } from "utils";

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

  function contextmenu(e: MouseEvent) {
    showOptionContext(e, [copyIDItem(channel)]);
  }
</script>

<div
  class="cursor-pointer m-1.5 p-2 rounded flex items-center box-border bg-black bg-opacity-30 hover:bg-opacity-20 relative"
  on:click={switchTo}
  on:contextmenu={contextmenu}
>
  {#if channel.icon || channel.isDM()}
    <img
      src={proxyURL(
        channel.isDM()
          ? channel.recipient?.generateAvatarURL({
              max_side: 64,
            })
          : channel.generateIconURL({
              max_side: 64,
            }),
        "image"
      )}
      width="20"
      height="20"
      class="object-cover aspect-square {channel.isDMBased() ? 'rounded-full' : ''}"
      alt=""
    />
  {:else if channel.isGroupDM()}
    <IconUsers size={20} />
  {:else if channel.isText()}
    <IconHash size={20} />
  {:else if channel.isVoice()}
    <IconVolume size={20} />
  {:else if channel.isSavedMessages()}
    <IconNotebook size={20} />
  {:else}
    <IconHome size={20} />
  {/if}
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

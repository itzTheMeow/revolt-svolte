<script lang="ts">
  import { UnreadState } from "Client";
  import { CMState } from "contextmenu/ContextMenuState";
  import Indicator from "extra/Indicator.svelte";
  import type { Channel } from "revolt-toolset";
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
  import { Copy, Hash, Users, Volume } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { copyText, proxyURL, testMuted, UserDetails } from "utils";

  export let channel: Channel;
  let isSelected = false;

  async function switchTo() {
    $SelectedChannel = channel;
    if (!$MobileLayout) selectBottom();
    PaneState.set(PaneStates.MIDDLE);
    if (channel.isTextBased()) {
      if (!$MessageCache[$SelectedChannel.id]?.length) {
        const m = await channel.messages.fetchMultiple({
          limit: 100,
        });
        pushMessages($SelectedChannel, m);
      }
      if (channel.checkUnread(testMuted($NotifSettings))) channel.ack();
    }
  }

  let isUnread = false;
  let numUnreads = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedChannel?.id == channel.id;
    isUnread = channel.isTextBased() && !!channel.checkUnread(testMuted($NotifSettings));
  }

  function contextmenu(e: MouseEvent) {
    CMState.set({
      type: "options",
      pos: {
        top: e.clientY,
        left: e.clientX,
      },
      options: [{ name: "Copy ID", clicked: () => copyText(channel.id), icon: Copy }],
    });
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
    <Users size={20} />
  {:else if channel.isText()}
    <Hash size={20} />
  {:else if channel.isVoice()}
    <Volume size={20} />
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
        text={numUnreads >= 100 ? "99+" : String(numUnreads || "")}
      />
    {/if}
  </div>
</div>

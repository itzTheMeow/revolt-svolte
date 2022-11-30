<script lang="ts">
  import { UnreadState } from "Client";
  import { Channel, Server } from "revolt.js";
  import { MessageCache, NotifSettings, SelectedServer } from "State";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";

  export let server: Server;
  let isSelected = false;

  let isUnread = false;
  let numUnreads = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedServer?._id == server._id;
    isUnread = !!server.isUnread({
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
  class="avatar {server.icon
    ? ''
    : 'placeholder'} cursor-pointer box-border rounded-full w-12 h-12 relative"
  on:click={() => SelectedServer.set(server)}
>
  {#if server.icon}
    <div class="w-12 h-12 rounded-full">
      <img
        src={proxyURL(server.generateIconURL({ max_side: 64 }), "image")}
        alt=""
        class="before:text-sm before:font-bold before:align-text-top before:flex before:justify-center"
      />
    </div>
  {:else}
    <div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
      <span>
        {server.name
          .split(" ")
          .map((a) => a[0].toUpperCase())
          .join("")}
      </span>
    </div>
  {/if}
  <div
    class="absolute top-0 left-0 w-12 h-12 rounded-full hover:bg-black hover:bg-opacity-20 !overflow-visible"
    style={isSelected ? `border: 2px solid ${$Theme["accent"]};` : ""}
  >
    {#if isUnread}
      <div
        class="absolute {isSelected
          ? '-right-1 -bottom-1'
          : '-right-0.5 -bottom-0.5'} flex items-center justify-center text-xs px-1 h-5 rounded-full text-right"
        style:background-color={$Theme["secondary-foreground"]}
        style:border="3px solid {$Theme["background"]}"
        style:color={$Theme["secondary-background"]}
        style:min-width="1.25rem"
      >
        {(numUnreads >= 100 ? "99+" : numUnreads) || ""}
      </div>
    {/if}
  </div>
</div>

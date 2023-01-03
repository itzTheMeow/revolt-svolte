<script lang="ts">
  import { UnreadState } from "Client";
  import Indicator from "extra/Indicator.svelte";
  import type { Server } from "revolt-toolset";
  import { NotifSettings, SelectedServer } from "State";
  import { Theme } from "Theme";
  import { proxyURL, testMuted } from "utils";
  import ServerEntry from "./ServerEntry.svelte";

  export let server: Server;
  let isSelected = false;

  let isUnread = false;
  let numUnreads = 0;
  $: {
    $UnreadState;
    isSelected = $SelectedServer?.id == server.id;
    isUnread = !!server.isUnread(testMuted($NotifSettings));
  }
</script>

<ServerEntry
  placeholder={!server.icon}
  onclick={() => SelectedServer.set(server)}
  tooltip={server.name}
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
      <Indicator
        pos="bottomRight"
        bg={$Theme["background"]}
        text={numUnreads >= 100 ? "99+" : String(numUnreads || "")}
        {isSelected}
      />
    {/if}
  </div>
</ServerEntry>

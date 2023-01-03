<script lang="ts">
  import { client } from "Client";
  import Indicator from "extra/Indicator.svelte";
  import type { Server } from "revolt-toolset";
  import { SelectedServer, ServerOrder } from "State";
  import { Refresh } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { proxyURL, StatusColor } from "utils";
  import ServerEntry from "./ServerEntry.svelte";
  import ServerIcon from "./ServerIcon.svelte";
  import ServerSeparator from "./ServerSeparator.svelte";

  let orderedServers = [...client.servers.values()],
    selectedDMs = false;
  $: {
    orderedServers = <Server[]>(
      [
        ...$ServerOrder.map((s) => client.servers.get(s)),
        ...client.servers.filter((s) => !$ServerOrder.includes(s.id)),
      ].filter((o) => o)
    );
    selectedDMs = !$SelectedServer;
  }
</script>

<div
  class="flex items-center flex-col gap-2.5 p-1.5 overflow-y-auto h-full"
  style="background-color:{$Theme['background']};scrollbar-width:none;--scroll-width:0px;"
  id="ServerList"
>
  <ServerEntry placeholder onclick={() => SelectedServer.set(null)} tooltip="Profile">
    <div class="w-12 h-12 rounded-full">
      <img
        src={proxyURL(client.user.generateAvatarURL({ max_side: 64 }), "image")}
        alt=""
        class="before:text-sm before:font-bold before:align-text-top before:flex before:justify-center"
      />
    </div>
    <div
      class="absolute top-0 left-0 w-12 h-12 rounded-full hover:bg-black hover:bg-opacity-20 !overflow-visible"
      style={selectedDMs ? `border: 2px solid ${$Theme["accent"]};` : ""}
    >
      <Indicator
        pos="bottomRight"
        color={$Theme[StatusColor(client.user)]}
        bg={$Theme["background"]}
        isSelected={selectedDMs}
      />
    </div>
  </ServerEntry>

  <ServerSeparator />

  {#each orderedServers as server}
    <ServerIcon {server} />
  {/each}

  <ServerSeparator />

  <ServerEntry placeholder onclick={() => window.location.reload()} tooltip="Reload">
    <div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
      <Refresh />
    </div>
  </ServerEntry>
</div>

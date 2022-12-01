<script>
  import { client } from "Client";
  import { ServerOrder } from "State";
  import { Refresh } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import ServerIcon from "./ServerIcon.svelte";

  let orderedServers = [...client.servers.values()];
  $: {
    orderedServers = [
      ...$ServerOrder.map((s) => client.servers.get(s)),
      ...[...client.servers.values()].filter((s) => !$ServerOrder.includes(s._id)),
    ].filter((o) => o);
  }
</script>

<div
  class="flex items-center flex-col gap-2.5 p-1.5 overflow-y-auto h-full"
  style="background-color:{$Theme['background']};scrollbar-width:none;--scroll-width:0px;"
  id="ServerList"
>
  {#each orderedServers as server}
    <ServerIcon {server} />
  {/each}

  <div
    class="avatar placeholder cursor-pointer box-border rounded-full w-12 h-12"
    on:click={() => window.location.reload()}
  >
    <div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
      <Refresh />
    </div>
  </div>
</div>

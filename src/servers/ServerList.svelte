<script>
  import { client } from "Client";
  import { Refresh } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import ServerIcon from "./ServerIcon.svelte";
</script>

<div
  class="flex items-center flex-col gap-2.5 p-1.5 overflow-y-auto h-full"
  style="background-color:{$Theme['background']};scrollbar-width:none;--scroll-width:0px;"
  id="ServerList"
>
  {#each [...client.servers.values()].sort( (s1, s2) => (s1.name.toLowerCase() > s2.name.toLowerCase() ? 1 : -1) ) as server}
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

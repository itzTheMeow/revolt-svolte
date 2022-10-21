<script>
  import { client } from "Client";
  import { Theme } from "Theme";

  const { default: ServerIcon } = require("./ServerIcon.svelte");
</script>

<div
  class="flex items-center flex-col gap-2.5 p-1.5 overflow-y-auto h-full"
  style="background-color:{$Theme['background']};scrollbar-width:none;"
>
  {#each [...client.servers.values()].sort( (s1, s2) => (s1.name.toLowerCase() > s2.name.toLowerCase() ? 1 : -1) ) as server}
    <ServerIcon {server} />
  {/each}
</div>

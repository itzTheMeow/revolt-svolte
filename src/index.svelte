<script lang="ts">
  import { client } from "Client";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
  import { onMount } from "svelte";
</script>

<div class="flex items-center justify-center h-screen w-screen">
  {#await new Promise((r) => client.once("ready", () => r(void 0)))}
    <Loader />
  {:then}
    <ServerList />
  {/await}
</div>

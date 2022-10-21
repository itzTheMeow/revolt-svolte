<script lang="ts">
  import ChannelList from "channels/ChannelList.svelte";
  import { client } from "Client";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
</script>

<div class="flex items-center justify-center h-screen w-screen">
  {#await new Promise((r) => client.once("ready", () => r(void 0)))}
    <Loader />
  {:then}
    <ServerList />
    <ChannelList />
  {/await}
</div>

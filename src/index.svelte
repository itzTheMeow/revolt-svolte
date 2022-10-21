<script lang="ts">
  import ChannelList from "channels/ChannelList.svelte";
  import { client } from "Client";
  import ContentList from "content/ContentList.svelte";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
  import { MessageCache, pushMessages } from "State";

  client.on("message", (message) => {
    if ($MessageCache[message.channel_id]) pushMessages(message.channel!, [message]);
  });
</script>

<div class="flex items-center justify-center h-screen w-screen">
  {#await new Promise((r) => client.once("ready", () => r(void 0)))}
    <Loader />
  {:then}
    <ServerList />
    <ChannelList />
    <ContentList />
  {/await}
</div>

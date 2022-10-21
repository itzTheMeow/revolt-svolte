<script lang="ts">
  import ChannelList from "channels/ChannelList.svelte";
  import { client } from "Client";
  import ContentList from "content/ContentList.svelte";
  import Loader from "Loader.svelte";
  import ServerList from "servers/ServerList.svelte";
  import { MessageCache, pendBottom, pushMessages, selectInput } from "State";
  import { afterUpdate } from "svelte";

  client.on("message", (message) => {
    if ($MessageCache[message.channel_id]) pushMessages(message.channel!, [message]);
  });

  let previous = "";
  afterUpdate(() => {
    if ($pendBottom) {
      const ListMessages = document.getElementById("MessageList");
      if (ListMessages) ListMessages.scrollTop = ListMessages.scrollHeight * 2;
      $pendBottom = false;
    }
    if (previous == document.body.innerHTML) return;
    previous = document.body.innerHTML;
    /*[ListServers, ListChannels, ListMessages, AutocompletePanel].forEach(
      (e) => e && disableBodyScroll(e, { allowTouchMove: () => true })
    );*/
    if ($selectInput) {
      $selectInput.focus();
      selectInput.set(null);
    }
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

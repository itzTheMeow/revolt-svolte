<script lang="ts">
  import { autocomplete, MessageCache, SelectedChannel, uploadedFiles } from "State";
  import { CircleX, Hash, Paperclip, Volume } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import AutocompleteItem from "./AutocompleteItem.svelte";
  import MessageItem from "./MessageItem.svelte";
  import VoiceChannel from "./VoiceChannel.svelte";
  import { client } from "Client";
  import Textbox from "./Textbox.svelte";
</script>

<div class="h-full flex-1 flex flex-col" style="background-color:{$Theme['primary-background']}">
  {#if $SelectedChannel}
    {#if $SelectedChannel.channel_type !== "VoiceChannel"}
      <div class="overflow-y-auto flex-1 flex flex-col break-words p-1.5">
        {#if $MessageCache[$SelectedChannel._id]?.length}
          {#each $MessageCache[$SelectedChannel._id].slice(-75) as message}
            <MessageItem {message} />
          {/each}
        {:else}
          ...
        {/if}
      </div>
      <Textbox />
    {:else}
      <VoiceChannel channel={$SelectedChannel} />
    {/if}
  {:else}
    Select a channel!
  {/if}
</div>

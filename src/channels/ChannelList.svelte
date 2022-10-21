<script lang="ts">
  import { SelectedServer } from "State";
  import { Theme } from "Theme";
  import ChannelItem from "./ChannelItem.svelte";
</script>

<div
  class="overflow-y-auto h-full w-56 py-1"
  style="background-color:{$Theme['secondary-background']}"
>
  {#if $SelectedServer}
    {#each $SelectedServer.orderedChannels as category}
      {#if $SelectedServer.orderedChannels.indexOf(category) && category.title !== "Default"}
        <div
          class="text-base text-primary ml-2 -mb-0.5 font-bold"
          style="color:{$Theme['accent']};"
        >
          {category.title}
        </div>
      {/if}
      {#each category.channels as channel}
        <ChannelItem {channel} />
      {/each}
    {/each}
  {:else}
    <div class="text-sm ml-1.5">No channels.</div>
  {/if}
</div>

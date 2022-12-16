<script lang="ts">
  import { CollapsedCategories, SelectedServer } from "State";
  import { ChevronDown, ChevronRight } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import ChannelItem from "./ChannelItem.svelte";

  $: {
    console.log($SelectedServer?.orderedChannels);
  }
</script>

<div
  class="overflow-y-auto h-full w-56 py-1 select-none"
  style="background-color:{$Theme['secondary-background']}"
  id="ChannelList"
>
  {#if $SelectedServer}
    {#each $SelectedServer.orderedChannels as category}
      {#if $SelectedServer.orderedChannels.indexOf(category) && category.title !== "Default"}
        <div
          class="text-base text-primary ml-2 mt-0.5 {$CollapsedCategories.includes(category.id)
            ? 'mb-1'
            : '-mb-0.5'} font-bold flex cursor-pointer items-center gap-0.5"
          style="color:{$Theme['accent']};"
          on:click={() => {
            if ($CollapsedCategories.includes(category.id))
              $CollapsedCategories = $CollapsedCategories.filter((c) => c !== category.id);
            else $CollapsedCategories = [...$CollapsedCategories, category.id];
          }}
        >
          {#if $CollapsedCategories.includes(category.id)}
            <ChevronRight size={16} />
          {:else}
            <ChevronDown size={16} />
          {/if}
          {category.title}
        </div>
      {/if}
      {#if !$CollapsedCategories.includes(category.id)}
        {#each category.channels as channel}
          <ChannelItem {channel} />
        {/each}
      {/if}
    {/each}
  {:else}
    <div class="text-sm ml-1.5">No channels.</div>
  {/if}
</div>

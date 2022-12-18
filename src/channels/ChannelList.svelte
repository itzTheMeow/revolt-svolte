<script lang="ts">
  import { CollapsedCategories, SelectedServer } from "State";
  import { onDestroy, onMount } from "svelte";
  import { ChevronDown, ChevronRight } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import ChannelItem from "./ChannelItem.svelte";

  let scrolledTop = true,
    scroller: HTMLDivElement;
  function handleScroll() {
    scrolledTop =
      scroller.scrollTop <= 0 || scroller.scrollHeight < scroller.parentElement!.offsetHeight;
  }
  let useBanner = true;
  $: {
    useBanner = !!$SelectedServer?.banner && scrolledTop;
  }

  let si: NodeJS.Timer;
  onMount(() => {
    if (si) clearInterval(si);
    si = setInterval(handleScroll, 6);
  });
  onDestroy(() => {
    if (si) clearInterval(si);
  });
</script>

<div
  class="h-full w-56 flex flex-col"
  style="background-color:{$Theme['secondary-background']}"
  id="ChannelList"
>
  {#if $SelectedServer}
    <div
      class="w-full {useBanner ? 'h-28' : 'h-10'} bg-cover bg-center flex"
      style:background-image={$SelectedServer.banner
        ? `url(${proxyURL($SelectedServer.generateBannerURL({ max_side: 480 }), "image")})`
        : ""}
      style:transition="height 200ms"
    >
      <div
        class="w-full mt-auto flex items-center py-1"
        style:background="linear-gradient(0deg, {$Theme["secondary-background"]}, transparent)"
      >
        <div class="font-bold text-lg w-full ml-2">{$SelectedServer.name}</div>
      </div>
    </div>
    <div class="py-1 overflow-y-auto flex-1" bind:this={scroller}>
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
    </div>
  {:else}
    <div class="text-sm ml-1.5">No channels.</div>
  {/if}
</div>

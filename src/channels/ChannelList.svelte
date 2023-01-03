<script lang="ts">
  import { client } from "Client";
  import UserTag from "extra/UserTag.svelte";
  import { CollapsedCategories, HomeChannel, SelectedServer } from "State";
  import { onDestroy, onMount } from "svelte";
  import { tippy } from "svelte-tippy";
  import { BrandGithub, ChevronDown, ChevronRight, Lock, LockOpen } from "tabler-icons-svelte";
  import { BRAND_COLOR, Theme } from "Theme";
  import { BRAND_NAME, COMMIT_HASH, proxyURL } from "utils";
  import ChannelItem from "./ChannelItem.svelte";

  let scrolledTop = true,
    scroller: HTMLDivElement;
  function handleScroll() {
    if (!scroller) return;
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
        {#if $SelectedServer.orderedChannels.indexOf(category) && category.id !== "default"}
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
            {category.name}
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
    <div class="flex gap-1.5 px-2 py-1.5 items-center">
      <img class="w-8 h-8" src="./logo.png" alt="" />
      <div class="text-xl font-bold" style:color={BRAND_COLOR}>{BRAND_NAME}</div>
      <div class="flex items-center gap-0.5 ml-auto self-start">
        <div
          use:tippy={{
            content:
              window.location.protocol == "https:"
                ? "Secure (HTTPS)"
                : "This window is not in a secure HTTPS context!",
            placement: "bottom",
          }}
        >
          {#if window.location.protocol == "https:"}
            <Lock size="18" color={$Theme["success"]} />
          {:else}
            <LockOpen size="18" color={$Theme["warning"]} />
          {/if}
        </div>
        <a
          href="https://github.com/itzTheMeow/revolt-svolte/tree/{COMMIT_HASH}"
          target="_blank"
          class="brightness-90"
          use:tippy={{
            content: "GitHub",
            placement: "bottom",
          }}
        >
          <UserTag text={COMMIT_HASH} color={BRAND_COLOR} icon={BrandGithub} />
        </a>
      </div>
    </div>
    <div class="pt-0.5 pb-1 overflow-y-auto flex-1" bind:this={scroller}>
      <ChannelItem channel={HomeChannel} />
      <ChannelItem channel={client.channels.find((c) => c.isSavedMessages())} />
      {#each client.channels
        .filter((c) => c.isDMBased())
        .sort( (c1, c2) => ((c1.lastMessageID || "") < (c2.lastMessageID || "") ? 1 : -1) ) as channel}
        <ChannelItem {channel} />
      {/each}
    </div>
  {/if}
</div>

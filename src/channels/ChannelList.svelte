<script lang="ts">
  import {
    IconBrandGithub,
    IconChevronDown,
    IconChevronRight,
    IconHeadphonesOff,
    IconLock,
    IconLockOpen,
    IconMicrophoneOff,
  } from "@tabler/icons-svelte";
  import { client } from "Client";
  import UserTag from "extra/UserTag.svelte";
  import type { Channel } from "revolt-toolset";
  import { CollapsedCategories, HomeChannel, SelectedServer } from "State";
  import { onDestroy, onMount } from "svelte";
  import { tippy } from "svelte-tippy";
  import { BRAND_COLOR, Theme } from "Theme";
  import { BRAND_NAME, COMMIT_HASH, GIT_URL, proxyURL } from "utils";
  import { voiceState, VoiceStatus } from "voice/VoiceState";
  import ChannelIcon from "./ChannelIcon.svelte";
  import ChannelItem from "./ChannelItem.svelte";
  import VoiceBarIcon from "./VoiceBarIcon.svelte";

  const MAX_USERS = 8;

  let scrolledTop = true,
    scroller: HTMLDivElement;
  function handleScroll() {
    if (!scroller) return;
    scrolledTop =
      scroller.scrollTop <= 0 || scroller.scrollHeight < scroller.parentElement!.offsetHeight;
  }
  let useBanner = true,
    savedMessages: Channel;
  $: {
    useBanner = !!$SelectedServer?.banner && scrolledTop;
    savedMessages = client.channels.find((c) => c.isSavedMessages());
  }

  let voiceConnection: Channel | null = null;
  $: {
    voiceConnection =
      $voiceState.status == VoiceStatus.CONNECTED
        ? client.channels.get($voiceState.roomId || "") || null
        : null;
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
  style:background={$Theme["secondary-background"]}
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
              <IconChevronRight size={16} />
            {:else}
              <IconChevronDown size={16} />
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
            <IconLock size={18} color={$Theme["success"]} />
          {:else}
            <IconLockOpen size={18} color={$Theme["warning"]} />
          {/if}
        </div>
        <a
          href="{GIT_URL}/tree/{COMMIT_HASH}"
          target="_blank"
          rel="noreferrer"
          class="brightness-90"
          use:tippy={{
            content: "GitHub",
            placement: "bottom",
          }}
        >
          <UserTag text={COMMIT_HASH} color={BRAND_COLOR} icon={IconBrandGithub} />
        </a>
      </div>
    </div>
    <div class="pt-0.5 pb-1 overflow-y-auto flex-1" bind:this={scroller}>
      <ChannelItem channel={HomeChannel} />
      {#if savedMessages}
        <ChannelItem channel={savedMessages} />
      {/if}
      {#each client.channels
        .filter((c) => c.isDMBased())
        .sort( (c1, c2) => ((c1.lastMessageID || "") < (c2.lastMessageID || "") ? 1 : -1) ) as channel}
        <ChannelItem {channel} />
      {/each}
    </div>
  {/if}
  {#if voiceConnection}
    <div class="flex flex-col gap-2 px-2 py-3">
      <div class="flex gap-1 items-center w-full">
        <ChannelIcon channel={voiceConnection} />
        <div class="text-lg overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
          {voiceConnection.name}
        </div>
        <VoiceBarIcon action="mute" color={$Theme["tertiary-foreground"]} />
        <VoiceBarIcon action="deafen" color={$Theme["tertiary-foreground"]} />
        <VoiceBarIcon action="disconnect" color={$Theme["error"]} />
      </div>
      <div class="flex w-full">
        {#each [...$voiceState.participants.keys()] as uid, ind}
          <div class="relative w-7 h-7 -mr-2">
            {#if ind == MAX_USERS}
              <div
                class="flex items-center justify-center rounded-full w-full h-full"
                style:background={$Theme["tooltip"]}
              >
                +{$voiceState.participants.size - MAX_USERS}
              </div>
            {:else if ind < MAX_USERS}
              <img
                src={proxyURL(client.users.get(uid)?.generateAvatarURL({ max_side: 64 }), "image")}
                alt={client.users.get(uid)?.username}
                class="rounded-full w-full h-full {(client.user?.id === uid &&
                  $voiceState.isDeaf()) ||
                !$voiceState.participants.get(uid)?.audio
                  ? 'brightness-50'
                  : ''}"
              />
              {#if (client.user?.id === uid && $voiceState.isDeaf()) || !$voiceState.participants.get(uid)?.audio}
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {#if client.user?.id === uid && $voiceState.isDeaf()}
                    <IconHeadphonesOff size={14} />
                  {:else if !$voiceState.participants.get(uid)?.audio}
                    <IconMicrophoneOff size={14} />
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

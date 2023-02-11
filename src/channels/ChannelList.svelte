<script lang="ts">
  import {
    IconBrandGithub,
    IconChevronDown,
    IconChevronRight,
    IconCircleCheck,
    IconHeadphonesOff,
    IconHexagonLetterR,
    IconLock,
    IconLockOpen,
    IconMicrophoneOff,
    IconSettingsFilled,
  } from "@tabler/icons-svelte";
  import { client } from "Client";
  import UserTag from "extra/UserTag.svelte";
  import { ModalStack } from "modals/ModalStack";
  import { SettingsServerPage } from "modals/Settings";
  import { RevoltServerFlags, type Channel } from "revolt-toolset";
  import { CollapsedCategories, HomeChannel, SelectedChannel, SelectedServer } from "State";
  import { onDestroy, onMount } from "svelte";
  import { tippy } from "svelte-tippy";
  import { BRAND_COLOR, Theme } from "Theme";
  import { BRAND_NAME, COMMIT_HASH, GIT_URL, ServerManagePermissions } from "utils";
  import { voiceState, VoiceStatus } from "voice/VoiceState";
  import ChannelIcon from "./ChannelIcon.svelte";
  import ChannelItem from "./ChannelItem.svelte";
  import VoiceBarIcon from "./VoiceBarIcon.svelte";

  const MAX_USERS = 8;

  let scrolledTop = true,
    scroller: HTMLDivElement,
    scrollTop = 0;
  function handleScroll(redo = true) {
    if (scroller) {
      scrollTop = scroller.scrollTop;
      scrolledTop = scroller.scrollHeight < scroller.parentElement!.offsetHeight;
    }
    if (redo && si) requestAnimationFrame(() => handleScroll());
  }
  let useBanner = true,
    savedMessages: Channel,
    h = 0;
  $: {
    useBanner = !!$SelectedServer?.banner;
    savedMessages = client.channels.find((c) => c.isSavedMessages());
  }
  $: h = useBanner ? (scrolledTop ? 112 : Math.max(112 - scrollTop, 40)) : 40;

  let voiceConnection: Channel | null = null;
  $: {
    voiceConnection =
      $voiceState.status == VoiceStatus.CONNECTED
        ? client.channels.get($voiceState.roomId || "") || null
        : null;
  }

  let si = false;
  onMount(() => {
    si = true;
    requestAnimationFrame(() => handleScroll());
  });
  onDestroy(() => {
    si = false;
  });
</script>

<div
  class="h-full w-56 flex flex-col relative"
  style:background={$Theme["secondary-background"]}
  id="ChannelList"
>
  {#if $SelectedServer}
    <div
      class="py-1 overflow-y-auto flex-1 {useBanner ? 'pt-28' : 'pt-10'}"
      style:paddinlg-top="{h}px"
      bind:this={scroller}
    >
      {#each $SelectedServer.orderedChannels as category (category.id)}
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
          {#each category.channels as channel (channel.id)}
            <ChannelItem {channel} />
          {/each}
        {/if}
      {/each}
    </div>
    <div
      class="absolute top-0 left-0 w-full bg-inherit bg-cover bg-center flex"
      style:background-image={$SelectedServer.banner
        ? `url(${$SelectedServer.generateBannerURL({ max_side: 480 })})`
        : ""}
      style:height="{h}px"
      style:transition="10ms height"
      on:scroll={() => handleScroll(false)}
    >
      <div
        class="w-full mt-auto flex items-center px-3 h-10 gap-1"
        style:background="linear-gradient(0deg, {$Theme["secondary-background"]}, transparent)"
      >
        {#if $SelectedServer.flags.has(RevoltServerFlags.Official)}
          <span use:tippy={{ content: "Official" }}><IconHexagonLetterR size={20} /></span>
        {/if}
        {#if $SelectedServer.flags.has(RevoltServerFlags.Verified)}
          <span use:tippy={{ content: "Verified" }}><IconCircleCheck size={20} /></span>
        {/if}
        <div class="font-bold text-lg w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
          {$SelectedServer.name}
        </div>
        {#if ServerManagePermissions.find((p) => $SelectedServer?.me?.permissions.has(p))}
          <span
            class="cursor-pointer hover:brightness-75"
            style:color={$Theme["secondary-foreground"]}
            on:click={() =>
              $SelectedServer &&
              ModalStack.push({
                type: "settings_server",
                server: $SelectedServer,
                page: SettingsServerPage.Overview,
              })}
          >
            <IconSettingsFilled size={24} stroke={0} />
          </span>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex gap-1.5 px-2 py-1.5 items-center">
      <img class="w-8 h-8" src="./logo.svg" alt="" />
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
        .sort( (c1, c2) => ((c1.lastMessageID || "") < (c2.lastMessageID || "") ? 1 : -1) ) as channel (channel.id)}
        <ChannelItem {channel} />
      {/each}
    </div>
  {/if}
  {#if voiceConnection}
    <div class="flex flex-col gap-2 px-2 py-3">
      <div class="flex gap-1 items-center w-full">
        <div
          class="flex items-center gap-1 overflow-hidden cursor-pointer hover:underline"
          on:click={() => {
            SelectedServer.set(voiceConnection?.isServerBased() ? voiceConnection.server : null);
            SelectedChannel.set(voiceConnection);
          }}
        >
          <ChannelIcon channel={voiceConnection} />
          <div class="text-lg overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
            {voiceConnection.name}
          </div>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <VoiceBarIcon action="mute" color={$Theme["tertiary-foreground"]} />
          <VoiceBarIcon action="deafen" color={$Theme["tertiary-foreground"]} />
          <VoiceBarIcon action="disconnect" color={$Theme["error"]} />
        </div>
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
                src={client.users.get(uid)?.generateAvatarURL({ max_side: 64 })}
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

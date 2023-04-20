<script lang="ts">
  import { IconAlertTriangle, IconHeadphonesOff, IconMicrophoneOff } from "@tabler/icons-svelte";
  import { client } from "Client";
  import Loader from "Loader.svelte";
  import Markdown from "markdown/Markdown.svelte";
  import type { VoiceChannel } from "revkit";
  import { Theme } from "Theme";
  import { voiceState, VoiceStatus } from "../voice/VoiceState";
  import VoiceChannelIcon from "./VoiceChannelIcon.svelte";

  let isConnectedHere = false;
  $: isConnectedHere =
    $voiceState.status == VoiceStatus.CONNECTED && $voiceState.roomId == channel.id;

  export let channel: VoiceChannel;
</script>

<div class="flex flex-col items-center justify-center w-full h-full">
  {#await $voiceState.loadVoice()}
    <div>Loading...</div>
  {:then _}
    <div
      class="h-10 w-full flex items-center justify-center"
      style:background={$Theme["secondary-background"]}
    >
      <div class="text-lg font-semibold">{channel.name}</div>
    </div>
    {#if channel.description}
      <div class="p-3 rounded mt-5" style:background={$Theme["secondary-background"]}>
        <Markdown text={channel.description} />
      </div>
    {/if}
    {#if isConnectedHere}
      <div class="flex mt-auto">
        {#each [...$voiceState.participants.keys()] as uid}
          <div class="relative w-16 h-16 mx-2">
            <img
              src={client.users.get(uid)?.generateAvatarURL({ max_side: 256 })}
              alt={client.users.get(uid)?.username}
              class="rounded-full w-full h-full"
            />
            {#if (client.user?.id === uid && $voiceState.isDeaf()) || !$voiceState.participants.get(uid)?.audio}
              <div
                class="absolute right-0 bottom-0 p-1 rounded-full"
                style:background={$Theme["error"]}
              >
                {#if client.user?.id === uid && $voiceState.isDeaf()}
                  <IconHeadphonesOff size={14} />
                {:else if !$voiceState.participants.get(uid)?.audio}
                  <IconMicrophoneOff size={14} />
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else if $voiceState.status !== VoiceStatus.CONNECTED && $voiceState.status !== VoiceStatus.READY}
      <div
        class="py-2 px-3 rounded-lg mt-auto flex items-center gap-2"
        style:background={$Theme["secondary-background"]}
      >
        {#if $voiceState.status == VoiceStatus.UNAVAILABLE}
          <div class="flex items-center gap-1" style:color={$Theme["error"]}>
            <IconAlertTriangle />
            <div>Voice Unavailable.</div>
          </div>
        {:else}
          <Loader />
          {#if $voiceState.status == VoiceStatus.LOADING}
            <div>Loading</div>
          {:else if $voiceState.status == VoiceStatus.AUTHENTICATING}
            <div>Authenticating</div>
          {:else if $voiceState.status == VoiceStatus.CONNECTING}
            <div>Connecting</div>
          {:else if $voiceState.status == VoiceStatus.RTC_CONNECTING}
            <div>RTC Connecting</div>
          {/if}
        {/if}
      </div>
    {/if}
    {#if $voiceState.status !== VoiceStatus.UNAVAILABLE}
      <div class="mt-auto mb-4 flex items-center gap-2">
        {#if isConnectedHere}
          <VoiceChannelIcon action="mute" color={$Theme["tertiary-foreground"]} />
          <VoiceChannelIcon action="deafen" color={$Theme["tertiary-foreground"]} />
          <VoiceChannelIcon action="disconnect" color={$Theme["error"]} />
        {:else if $voiceState.status == VoiceStatus.READY || $voiceState.status == VoiceStatus.CONNECTED}
          <VoiceChannelIcon action={channel} color={$Theme["success"]} />
        {:else}
          <VoiceChannelIcon action="cancel" color={$Theme["error"]} />
        {/if}
      </div>
    {/if}
  {/await}
</div>

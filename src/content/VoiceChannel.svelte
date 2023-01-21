<script lang="ts">
  import {
    IconAlertTriangle,
    IconHeadphones,
    IconHeadphonesOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconPhoneCall,
    IconPhoneOff,
  } from "@tabler/icons-svelte";
  import { client } from "Client";
  import Loader from "Loader.svelte";
  import Markdown from "markdown/Markdown.svelte";
  import type { VoiceChannel } from "revolt-toolset";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import { voiceState, VoiceStatus } from "../voice/VoiceState";

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
      <div class="flex">
        {#each [...$voiceState.participants.keys()] as uid}
          <div class="relative w-16 h-16 mx-2">
            <img
              src={proxyURL(client.users.get(uid)?.generateAvatarURL({ max_side: 256 }), "image")}
              alt={client.users.get(uid)?.username}
              class="rounded-full w-full h-full"
            />
            {#if (client.user?.id === uid && $voiceState.isDeaf()) || !$voiceState.participants.get(uid)?.audio}
              <div class="absolute right-0 bottom-0 p-1 bg-error rounded-full">
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
      <div class="mt-auto mb-4 flex items-center">
        {#if isConnectedHere}
          {#if $voiceState.isProducing("audio")}
            <div
              class="p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
              style="background-color:{$Theme['tooltip']};"
              on:click={async () => {
                await $voiceState.stopProducing("audio");
                $voiceState = $voiceState;
              }}
            >
              <IconMicrophone size={20} />
            </div>
          {:else}
            <div
              class="p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
              style="background-color:{$Theme['tooltip']};"
              on:click={async () => {
                await $voiceState.startProducing("audio");
                $voiceState = $voiceState;
              }}
            >
              <IconMicrophoneOff size={20} />
            </div>
          {/if}
          {#if $voiceState.isDeaf()}
            <div
              class="mx-1.5 p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
              style="background-color:{$Theme['tooltip']};"
              on:click={async () => {
                await $voiceState.stopDeafen();
                $voiceState = $voiceState;
              }}
            >
              <IconHeadphonesOff size={20} />
            </div>
          {:else}
            <div
              class="mx-1.5 p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
              style="background-color:{$Theme['tooltip']};"
              on:click={async () => {
                await $voiceState.startDeafen();
                $voiceState = $voiceState;
              }}
            >
              <IconHeadphones size={20} />
            </div>
          {/if}
          <div
            class="p-3 bg-error inline-flex items-center justify-center rounded-full cursor-pointer"
            on:click={async () => {
              $voiceState.disconnect();
              $voiceState = $voiceState;
            }}
          >
            <IconPhoneOff size={20} />
          </div>
        {:else if $voiceState.status == VoiceStatus.READY || $voiceState.status == VoiceStatus.CONNECTED}
          <div
            class="p-3 bg-success inline-flex items-center justify-center rounded-full cursor-pointer"
            on:click={async () => {
              try {
                await $voiceState.connect(channel);
              } catch (err) {
                alert("WebRTC is probably not enabled in settings!\n" + err);
              }
            }}
          >
            <IconPhoneCall size={20} />
          </div>
        {/if}
      </div>
    {/if}
  {/await}
</div>

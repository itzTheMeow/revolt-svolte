<script lang="ts">
  import { client } from "Client";
  import type { Channel } from "revolt-toolset";
  import {
    Headphones,
    HeadphonesOff,
    Microphone,
    MicrophoneOff,
    PhoneCall,
    PhoneOff,
  } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import { voiceState as VOICE_STATE, VoiceStatus } from "../voice/VoiceState";

  let voiceState = VOICE_STATE;
  VOICE_STATE.events.on("stateChange", () => (voiceState = voiceState));

  let isConnectedHere = false;
  $: isConnectedHere =
    voiceState.status == VoiceStatus.CONNECTED && voiceState.roomId == channel.id;

  export let channel: Channel;
</script>

<div class="flex flex-col items-center justify-center w-full h-full">
  {#await voiceState.loadVoice()}
    <div>Loading...</div>
  {:then _}
    <div class="mb-auto mt-3 text-lg font-semibold">{channel.name}</div>
    {#if isConnectedHere}
      <div class="flex">
        {#each [...voiceState.participants.keys()] as uid}
          <div class="relative w-16 h-16 mx-2">
            <img
              src={proxyURL(client.users.get(uid)?.generateAvatarURL({ max_side: 256 }), "image")}
              alt={client.users.get(uid)?.username}
              class="rounded-full w-full h-full"
            />
            {#if (client.user?.id === uid && voiceState.isDeaf()) || !voiceState.participants.get(uid)?.audio}
              <div class="absolute right-0 bottom-0 p-1 bg-error rounded-full">
                {#if client.user?.id === uid && voiceState.isDeaf()}
                  <HeadphonesOff size={14} />
                {:else if !voiceState.participants.get(uid)?.audio}
                  <MicrophoneOff size={14} />
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else if voiceState.status == VoiceStatus.LOADING}
      <div>Loading...</div>
    {:else if voiceState.status == VoiceStatus.AUTHENTICATING}
      <div>Authenticating...</div>
    {:else if voiceState.status == VoiceStatus.CONNECTING}
      <div>Connecting...</div>
    {:else if voiceState.status == VoiceStatus.RTC_CONNECTING}
      <div>RTC Connecting...</div>
    {/if}
    <div class="mt-auto mb-4 flex items-center">
      {#if isConnectedHere}
        {#if voiceState.isProducing("audio")}
          <div
            class="p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
            style="background-color:{$Theme['tooltip']};"
            on:click={async () => {
              await voiceState.stopProducing("audio");
              voiceState = voiceState;
            }}
          >
            <Microphone size={20} />
          </div>
        {:else}
          <div
            class="p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
            style="background-color:{$Theme['tooltip']};"
            on:click={async () => {
              await voiceState.startProducing("audio");
              voiceState = voiceState;
            }}
          >
            <MicrophoneOff size={20} />
          </div>
        {/if}
        {#if voiceState.isDeaf()}
          <div
            class="mx-1.5 p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
            style="background-color:{$Theme['tooltip']};"
            on:click={async () => {
              await voiceState.stopDeafen();
              voiceState = voiceState;
            }}
          >
            <HeadphonesOff size={20} />
          </div>
        {:else}
          <div
            class="mx-1.5 p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
            style="background-color:{$Theme['tooltip']};"
            on:click={async () => {
              await voiceState.startDeafen();
              voiceState = voiceState;
            }}
          >
            <Headphones size={20} />
          </div>
        {/if}
        <div
          class="p-3 bg-error inline-flex items-center justify-center rounded-full cursor-pointer"
          on:click={async () => {
            voiceState.disconnect();
            voiceState = voiceState;
          }}
        >
          <PhoneOff size={20} />
        </div>
      {:else if voiceState.status == VoiceStatus.READY || voiceState.status == VoiceStatus.CONNECTED}
        <div
          class="p-3 bg-success inline-flex items-center justify-center rounded-full cursor-pointer"
          on:click={async () => {
            try {
              await voiceState.connect(channel);
            } catch (err) {
              alert("WebRTC is probably not enabled in settings!\n" + err);
            }
          }}
        >
          <PhoneCall size={20} />
        </div>
      {/if}
    </div>
  {/await}
</div>

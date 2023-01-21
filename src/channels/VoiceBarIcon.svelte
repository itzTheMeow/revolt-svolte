<script lang="ts">
  import {
    IconHeadphones,
    IconHeadphonesOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconPhoneOff,
  } from "@tabler/icons-svelte";
  import tinycolor from "tinycolor2";
  import { voiceState } from "voice/VoiceState";

  export let color: string | undefined;
  export let action: "disconnect" | "mute" | "deafen";

  let isMuted = false,
    isDeaf = false;
  $: {
    isMuted = !$voiceState.isProducing("audio");
    isDeaf = !!$voiceState.isDeaf();
  }
</script>

<div
  class="rounded p-1 hover:brightness-125 cursor-pointer"
  style:background={tinycolor(color).setAlpha(0.2).toRgbString()}
  style:color={tinycolor(color).setAlpha(1).toRgbString()}
  on:click={() => {
    switch (action) {
      case "mute":
        if (isMuted) $voiceState.startProducing("audio");
        else $voiceState.stopProducing("audio");
        break;
      case "deafen":
        if (isDeaf) $voiceState.stopDeafen();
        else $voiceState.startDeafen();
        break;
      case "disconnect":
        $voiceState.disconnect();
        break;
    }
  }}
>
  {#if action == "disconnect"}
    <IconPhoneOff size={18} />
  {:else if action == "mute"}
    {#if isMuted}
      <IconMicrophoneOff size={18} />
    {:else}
      <IconMicrophone size={18} />
    {/if}
  {:else if action == "deafen"}
    {#if isDeaf}
      <IconHeadphonesOff size={18} />
    {:else}
      <IconHeadphones size={18} />
    {/if}
  {/if}
</div>

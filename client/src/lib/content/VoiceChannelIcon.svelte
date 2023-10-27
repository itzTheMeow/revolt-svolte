<script lang="ts">
  import {
    IconHeadphones,
    IconHeadphonesOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconPhoneCall,
    IconPhoneOff,
    IconX,
  } from "@tabler/icons-svelte";
  import type { VoiceChannel } from "revkit";
  import tinycolor from "tinycolor2";
  import { voiceState } from "voice/VoiceState";

  export let color: string | undefined;
  export let action: "disconnect" | "mute" | "deafen" | "cancel" | VoiceChannel;

  let isMuted = false,
    isDeaf = false;
  $: {
    isMuted = !$voiceState.isProducing("audio");
    isDeaf = !!$voiceState.deafened;
  }
</script>

<div
  class="p-3 inline-flex items-center justify-center rounded-full cursor-pointer"
  style:background={tinycolor(color).setAlpha(0.4).toRgbString()}
  style:color={tinycolor(color).setAlpha(1).toRgbString()}
  on:click={() => {
    switch (action) {
      case "mute":
        if (isMuted) $voiceState.play("audio");
        else $voiceState.stopProduce("audio");
        break;
      case "deafen":
        if (isDeaf) $voiceState.stopDeafen();
        else $voiceState.startDeafen();
        break;
      case "disconnect":
      case "cancel":
        $voiceState.disconnect();
        break;
      default:
        try {
          $voiceState.connect(action);
        } catch (err) {
          alert("WebRTC is probably not enabled in settings!\n" + err);
        }
        break;
    }
  }}
>
  {#if action == "disconnect"}
    <IconPhoneOff size={20} />
  {:else if action == "cancel"}
    <IconX size={20} />
  {:else if action == "mute"}
    {#if isMuted}
      <IconMicrophoneOff size={20} />
    {:else}
      <IconMicrophone size={20} />
    {/if}
  {:else if action == "deafen"}
    {#if isDeaf}
      <IconHeadphonesOff size={20} />
    {:else}
      <IconHeadphones size={20} />
    {/if}
  {:else}
    <IconPhoneCall size={20} />
  {/if}
</div>

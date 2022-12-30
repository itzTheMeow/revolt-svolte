<script lang="ts">
  import { client } from "Client";
  import type { File } from "revolt-api";
  import { fullscreenElement } from "State";
  import {
    Maximize,
    Minimize,
    PlayerPause,
    PlayerPlay,
    Rotate,
    Volume,
    Volume2,
    Volume3,
  } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { formatDuration, proxyURL } from "utils";
  import Slider from "./Slider.svelte";

  export let src: File;
  export let style = "";

  let isPlaying = false,
    didEnd = false,
    seekTime = 0,
    duration = 0,
    shouldReplay = false,
    isMuted = false,
    originalVolume = 1,
    volume = 1,
    volumeHover = false,
    volumeDrag = false;

  let video: HTMLVideoElement, player: HTMLDivElement;

  $: {
    duration = Math.round(duration * 100) / 100;
    seekTime = Math.round(seekTime * 100) / 100;
    didEnd = seekTime == duration;
  }
</script>

<div class="block rounded overflow-hidden relative" {style} bind:this={player}>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    src={proxyURL(client.generateFileURL(src), "any")}
    bind:this={video}
    on:play={() => ((isPlaying = true), (didEnd = false))}
    on:pause={() => (isPlaying = false)}
    on:ended={() => (isPlaying = false)}
    bind:currentTime={seekTime}
    bind:duration
    bind:volume
  />
  <div
    class="absolute bottom-0 left-0 h-6 w-full flex items-center bg-black bg-opacity-80 gap-1 px-1.5"
  >
    <div
      class="cursor-pointer hover:brightness-75"
      on:click={() => {
        if (didEnd) {
          video.currentTime = 0;
          video.play();
        } else if (isPlaying) video.pause();
        else video.play();
      }}
    >
      {#if didEnd}
        <Rotate size={20} /> <!-- TODO: change to reload when @tabler/icons-svelte is released -->
      {:else if isPlaying}
        <PlayerPause size={20} />
      {:else}
        <PlayerPlay size={20} />
      {/if}
    </div>
    <div
      class="flex items-center"
      on:mouseenter={() => (volumeHover = true)}
      on:mouseleave={() => (volumeHover = false)}
    >
      <div
        class="cursor-pointer hover:brightness-75"
        on:click={() => {
          if (isMuted || !originalVolume || !volume) {
            volume = originalVolume || 1;
            isMuted = false;
          } else {
            originalVolume = volume;
            volume = 0;
            isMuted = true;
          }
        }}
      >
        {#if volume > 0.5}
          <Volume size={20} />
        {:else if volume > 0}
          <Volume2 size={20} />
        {:else}
          <Volume3 size={20} />
        {/if}
      </div>
      {#if volumeHover || volumeDrag}
        <Slider
          max={1}
          step={0.1}
          bind:value={volume}
          className="w-20"
          on:dragstart={() => (volumeDrag = true)}
          on:dragend={() => (volumeDrag = false)}
        />
      {/if}
    </div>
    {#if !volumeHover && !volumeDrag}
      <div
        class="text-xs font-mono w-[5.5rem] text-center"
        style:color={$Theme["tertiary-foreground"]}
      >
        {formatDuration(seekTime)}<span class="mx-[1px]">/</span>{formatDuration(duration)}
      </div>
    {/if}
    <div class="flex-1">
      <Slider
        max={duration}
        bind:value={seekTime}
        step={0.01}
        on:dragstart={() => ((shouldReplay = isPlaying), video.pause())}
        on:dragend={() => shouldReplay && video.play()}
      />
    </div>
    <div
      class="cursor-pointer hover:brightness-75"
      on:click={() => ($fullscreenElement ? document.exitFullscreen() : player.requestFullscreen())}
    >
      {#if $fullscreenElement}
        <Minimize size={18} />
      {:else}
        <Maximize size={18} />
      {/if}
    </div>
  </div>
</div>

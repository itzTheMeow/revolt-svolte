<script lang="ts">
  import { client } from "Client";
  import type { File } from "revolt-api";
  import { fullscreenElement, MobileLayout } from "State";
  import { onDestroy, onMount } from "svelte";
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
  import { clickoutside, formatDuration, proxyURL } from "utils";
  import Slider from "./Slider.svelte";

  export let src: File;
  export let style = "";

  let hasFocus = false,
    isPlaying = false,
    didEnd = false,
    seekTime = 0,
    duration = 0,
    shouldReplay = false,
    isMuted = false,
    originalVolume = 1,
    volume = 1,
    volumeHover = false,
    volumeDrag = false,
    videoClicked = false;

  let video: HTMLVideoElement, player: HTMLDivElement;

  $: {
    duration = Math.round(duration * 100) / 100;
    seekTime = Math.round(seekTime * 100) / 100;
    didEnd = seekTime == duration;
    volume = Math.round(volume * 10) / 10;
  }

  function playClick() {
    if (didEnd) {
      video.currentTime = 0;
      video.play();
    } else if (isPlaying) video.pause();
    else video.play();
  }

  function handleKey(e: KeyboardEvent) {
    if (!hasFocus) return;
    let didKey = true;
    switch (e.code) {
      case "Escape":
        hasFocus = false;
        if ($fullscreenElement) document.exitFullscreen();
        break;
      case "Space":
      case "KeyK":
        playClick();
        break;
      case "ArrowUp":
        volume = Math.min(1, volume + 0.1);
        break;
      case "ArrowDown":
        volume = Math.max(0, volume - 0.1);
        break;
      case "ArrowLeft":
        seekTime = Math.max(0, seekTime - (e.shiftKey ? 5 : 1));
        break;
      case "ArrowRight":
        seekTime = Math.min(duration, seekTime + (e.shiftKey ? 5 : 1));
        break;
      case "KeyF":
        if ($fullscreenElement) document.exitFullscreen();
        else player.requestFullscreen();
        break;
      default:
        didKey = false;
    }
    if (didKey) {
      e.preventDefault();
      return false;
    }
  }
  onMount(() => {
    window.addEventListener("keydown", handleKey);
    seekTime = 0.01;
  });
  onDestroy(() => {
    window.removeEventListener("keydown", handleKey);
  });
</script>

<div
  class="block rounded overflow-hidden relative"
  {style}
  bind:this={player}
  on:click={() => (hasFocus = true)}
  use:clickoutside={() => (hasFocus = false)}
>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    src={proxyURL(client.generateFileURL(src), "any")}
    bind:this={video}
    on:play={() => ((isPlaying = true), (didEnd = false))}
    on:pause={() => (isPlaying = false)}
    on:ended={() => (isPlaying = false)}
    on:click={playClick}
    bind:currentTime={seekTime}
    bind:duration
    bind:volume
    preload="metadata"
  />
  {#if !$MobileLayout}
    <div
      class="absolute bottom-0 left-0 h-6 w-full flex items-center bg-black bg-opacity-80 gap-1 px-1.5"
    >
      <div class="cursor-pointer hover:brightness-75" on:click={playClick}>
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
        on:click={() =>
          $fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()}
      >
        {#if $fullscreenElement}
          <Minimize size={18} />
        {:else}
          <Maximize size={18} />
        {/if}
      </div>
    </div>
  {:else if !videoClicked}
    <div
      class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center [transform:translateZ(1px)]"
      on:click={() => {
        video.click();
        videoClicked = true;
      }}
    >
      <div class="bg-black bg-opacity-70 p-2 rounded-full w-fit h-fit"><PlayerPlay /></div>
    </div>
  {/if}
</div>

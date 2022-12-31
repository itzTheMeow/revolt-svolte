<script lang="ts">
  import byteSize from "byte-size";
  import { client } from "Client";
  import type { File } from "revolt-api";
  import { fullscreenElement } from "State";
  import { onDestroy, onMount } from "svelte";
  import {
    Download,
    FileMusic,
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
    volumeDrag = false;

  let audio: HTMLAudioElement, player: HTMLDivElement;

  $: {
    duration = Math.round(duration * 100) / 100;
    seekTime = Math.round(seekTime * 100) / 100;
    didEnd = seekTime == duration;
    volume = Math.round(volume * 10) / 10;
  }

  function playClick() {
    if (didEnd) {
      audio.currentTime = 0;
      audio.play();
    } else if (isPlaying) audio.pause();
    else audio.play();
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
  });
  onDestroy(() => {
    window.removeEventListener("keydown", handleKey);
  });
</script>

<div
  class="rounded-2xl overflow-hidden flex flex-col select-none max-w-[18rem] px-3 py-2 gap-2"
  {style}
  bind:this={player}
  on:click={() => (hasFocus = true)}
  use:clickoutside={() => (hasFocus = false)}
  style:background={$Theme["secondary-background"]}
>
  <audio
    class="hidden"
    src={proxyURL(client.generateFileURL(src), "any")}
    bind:this={audio}
    on:play={() => ((isPlaying = true), (didEnd = false))}
    on:pause={() => (isPlaying = false)}
    on:ended={() => (isPlaying = false)}
    on:click={playClick}
    bind:currentTime={seekTime}
    bind:duration
    bind:volume
  />
  <div class="flex items-center gap-1.5 font-semibold">
    <div class="-mr-0.5"><FileMusic size={18} /></div>
    <div>{src.filename}</div>
    <div class="ml-auto flex items-center gap-1" style:color={$Theme["tertiary-foreground"]}>
      <div class="text-xs">
        {byteSize(src.size).toString().toUpperCase()}
      </div>
      <a
        class="cursor-pointer hover:brightness-150"
        href={client.generateFileURL(src)?.replace("attachments", "attachments/download")}
        target="_blank"
      >
        <Download size={20} />
      </a>
    </div>
  </div>
  <div class="flex items-center gap-1">
    <div class="cursor-pointer hover:brightness-75" on:click={playClick}>
      {#if didEnd}
        <Rotate size={20} />
        <!-- TODO: change to reload when @tabler/icons-svelte is released -->
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
        on:dragstart={() => ((shouldReplay = isPlaying), audio.pause())}
        on:dragend={() => shouldReplay && audio.play()}
      />
    </div>
  </div>
</div>

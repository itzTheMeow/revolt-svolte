<script lang="ts">
  import {
    IconDownload,
    IconMaximize,
    IconMinimize,
    IconPlayerPause,
    IconPlayerPlay,
    IconReload,
    IconVolume,
    IconVolume2,
    IconVolume3,
  } from "@tabler/icons-svelte";
  import byteSize from "byte-size";
  import { mediaContext, showOptionContext } from "contextmenu/ContextMenus";
  import type { Attachment } from "revolt-toolset";
  import { fullscreenElement, MobileLayout } from "State";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { Theme } from "Theme";
  import { clickoutside, formatDuration } from "utils";
  import Slider from "./Slider.svelte";

  export let src: Attachment | string;
  export let style = "";
  export let alt = "";

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
    videoClicked = false,
    showBar = true,
    paneHover = false,
    paneTimeout: NodeJS.Timeout;

  let video: HTMLVideoElement, player: HTMLDivElement;

  $: {
    duration = Math.round(duration * 100) / 100;
    seekTime = Math.round(seekTime * 100) / 100;
    didEnd = seekTime == duration;
    volume = Math.round(volume * 10) / 10;
    showBar = didEnd || !isPlaying || paneHover;
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
        seekTime = Math.max(0, seekTime - (e.ctrlKey ? 1 / 60 : e.shiftKey ? 5 : 1));
        break;
      case "ArrowRight":
        seekTime = Math.min(duration, seekTime + (e.ctrlKey ? 1 / 60 : e.shiftKey ? 5 : 1));
        break;
      case "Comma":
        seekTime = Math.max(0, seekTime - 1 / 60);
        break;
      case "Period":
        seekTime = Math.min(duration, seekTime + 1 / 60);
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
  class="block rounded overflow-hidden relative select-none"
  {style}
  bind:this={player}
  on:click={() => (hasFocus = true)}
  use:clickoutside={() => (hasFocus = false)}
  on:mouseenter={() => {
    if (paneTimeout) clearTimeout(paneTimeout);
    paneHover = true;
  }}
  on:mousemove={() => {
    paneHover = true;
    if (paneTimeout) clearTimeout(paneTimeout);
    paneTimeout = setTimeout(() => {
      paneHover = false;
    }, 400);
  }}
  on:mouseleave={() => {
    if (paneTimeout) clearTimeout(paneTimeout);
    paneTimeout = setTimeout(() => {
      paneHover = false;
    }, 150);
  }}
  on:contextmenu|stopPropagation|preventDefault={(e) =>
    typeof src !== "string" && showOptionContext(e, mediaContext(src))}
>
  <video
    src={typeof src == "string" ? src : src.generateURL()}
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
    {#if showBar}
      <div
        class="absolute top-0 left-0 w-full flex items-center gap-1.5 font-semibold px-2 pt-2 pb-6"
        style:background="linear-gradient(0deg, transparent, rgba(0,0,0,0.9))"
        transition:slide|local={{ duration: 150 }}
      >
        <div>{alt || (typeof src == "string" ? src.split("/").pop() || "Video" : src.name)}</div>
        <div class="ml-auto flex items-center gap-1" style:color={$Theme["tertiary-foreground"]}>
          {#if typeof src !== "string"}
            <div class="text-xs">
              {byteSize(src.size).toString().toUpperCase()}
            </div>
          {/if}
          <a
            class="cursor-pointer hover:brightness-150"
            href={typeof src == "string" ? src : src.generateDownloadURL()}
            target="_blank"
            rel="noreferrer"
          >
            <IconDownload size={20} />
          </a>
        </div>
      </div>
      <div
        class="absolute bottom-0 left-0 h-6 w-full flex items-center bg-black bg-opacity-90 gap-1 px-1.5"
        transition:slide|local={{ duration: 150 }}
      >
        <div class="cursor-pointer hover:brightness-75" on:click={playClick}>
          {#if didEnd}
            <IconReload size={20} />
          {:else if isPlaying}
            <IconPlayerPause size={20} />
          {:else}
            <IconPlayerPlay size={20} />
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
              <IconVolume size={20} />
            {:else if volume > 0}
              <IconVolume2 size={20} />
            {:else}
              <IconVolume3 size={20} />
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
            <IconMinimize size={18} />
          {:else}
            <IconMaximize size={18} />
          {/if}
        </div>
      </div>
    {/if}
  {:else if !videoClicked}
    <div
      class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center [transform:translateZ(1px)]"
      on:click={() => {
        video.click();
        videoClicked = true;
      }}
      data-clickable
    >
      <div class="bg-black bg-opacity-70 p-2 rounded-full w-fit h-fit"><IconPlayerPlay /></div>
    </div>
  {/if}
</div>

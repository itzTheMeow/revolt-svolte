<script lang="ts">
  import { client } from "Client";
  import type { File } from "revolt-api";
  import { PlayerPause, PlayerPlay, Rotate } from "tabler-icons-svelte";
  import { proxyURL } from "utils";
  import Slider from "./Slider.svelte";

  export let src: File;
  export let style = "";

  let isPlaying = false,
    didEnd = false;

  let video: HTMLVideoElement;
</script>

<div class="block rounded overflow-hidden relative" {style}>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    src={proxyURL(client.generateFileURL(src), "any")}
    bind:this={video}
    on:play={() => ((isPlaying = true), (didEnd = false))}
    on:pause={() => (isPlaying = false)}
    on:ended={() => ((isPlaying = false), (didEnd = true))}
  />
  <div class="absolute bottom-0 left-0 h-6 w-full flex items-center bg-black bg-opacity-80 gap-0.5">
    <div
      class="cursor-pointer hover:brightness-50"
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
    <div class="flex-1">
      <Slider />
    </div>
  </div>
</div>

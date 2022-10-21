<script lang="ts">
  import type { Server } from "revolt.js";
  import { SelectedServer } from "State";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";

  export let server: Server;

  const hasIcon = !!server.icon;
</script>

<div
  class="avatar {hasIcon
    ? ''
    : 'placeholder'} cursor-pointer box-border rounded-full w-12 h-12 relative"
  on:click={() => SelectedServer.set(server)}
>
  {#if hasIcon}
    <div class="w-12 h-12 rounded-full">
      <img
        src={proxyURL(server.generateIconURL({ max_side: 64 }), "image")}
        alt=""
        class="before:text-sm before:font-bold before:align-text-top before:flex before:justify-center"
      />
    </div>
  {:else}
    <div class="bg-black bg-opacity-30 w-12 h-12 rounded-full">
      <span
        >{server.name
          .split(" ")
          .map((a) => a[0].toUpperCase())
          .join("")}</span
      >
    </div>
  {/if}
  {#if $SelectedServer?._id == server._id}
    <div
      class="absolute top-0 left-0 w-12 h-12 rounded-full"
      style="border: 2px solid {$Theme['accent']};"
    />
  {/if}
</div>

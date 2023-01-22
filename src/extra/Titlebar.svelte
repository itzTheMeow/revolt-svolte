<script lang="ts">
  import { IconMaximize, IconMinimize, IconMinus, IconX } from "@tabler/icons-svelte";
  import { ElectronFullscreen, Native } from "Native";
  import { Theme } from "Theme";
  import { BRAND_NAME } from "utils";
</script>

<div
  class="w-full flex items-center pl-2 bg-inherit select-none"
  style="height:{Native.titlebarHeight}px;border-bottom:1px solid rgba(0,0,0,0.2);"
>
  <div class="flex-1 flex items-center gap-1" style="-webkit-app-region:drag;">
    <img class="w-5 h-5" src="./logo.png" />
    <div class="font-semibold">{BRAND_NAME}</div>
  </div>
  <div
    class="cursor-pointer hover:brightness-75 bg-inherit active:brightness-50 rounded-none h-full flex items-center justify-center"
    style="width:{Native.titlebarHeight * 1.5}px;"
    on:click={Native.min}
  >
    <IconMinus size={Native.titlebarHeight - 10} />
  </div>
  <div
    class="cursor-pointer hover:brightness-75 bg-inherit active:brightness-50 rounded-none h-full flex items-center justify-center"
    style="width:{Native.titlebarHeight * 1.5}px;"
    on:click={Native.max}
  >
    {#if $ElectronFullscreen}
      <IconMinimize size={Native.titlebarHeight - 10} />
    {:else}
      <IconMaximize size={Native.titlebarHeight - 12} />
    {/if}
  </div>
  <div
    class="cursor-pointer hover:bg-[var(--err)] transition-colors active:brightness-75 rounded-none h-full flex items-center justify-center"
    style="width:{Native.titlebarHeight * 1.5}px;--err:{$Theme['error']}"
    on:click={Native.close}
  >
    <IconX size={Native.titlebarHeight - 8} />
  </div>
</div>

<script lang="ts">
  import type { Message } from "revolt.js";
  import { MobileLayout, selectBottom, updateReplies } from "State";
  import { CornerUpLeft } from "tabler-icons-svelte";
  import { Theme } from "Theme";

  export let message: Message;
</script>

<div
  class="absolute {$MobileLayout ? '-top-6 right-5 h-12' : '-top-4 right-3 h-8'} flex rounded-lg"
  data-hover-item
  style="background-color:{$Theme['primary-header']};"
>
  <div
    class="rounded-lg {$MobileLayout
      ? 'h-12 w-12'
      : 'h-8 w-8'} bg-inherit cursor-pointer flex items-center justify-center hover:brightness-90 active:brightness-75"
    on:click={() => {
      updateReplies(message);
      selectBottom();
    }}
  >
    <CornerUpLeft />
  </div>
</div>

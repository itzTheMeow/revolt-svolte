<script lang="ts">
  import { AppWidth, PaneLeft, SelectedServer } from "State";
  import { Theme } from "Theme";

  let membar: HTMLDivElement;
</script>

<div
  class="overflow-y-auto h-full w-64 py-1 absolute"
  style="background-color:{$Theme['secondary-background']};left:{Math.max(
    //$AppWidth - (membar?.offsetWidth || 0),
    $PaneLeft + $AppWidth
  )}px;"
  id="MemberBar"
  bind:this={membar}
>
  {#if $SelectedServer}
    member list
  {:else}
    <div class="text-sm ml-1.5">No members.</div>
  {/if}
</div>

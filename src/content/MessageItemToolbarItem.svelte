<script lang="ts">
  import { MobileLayout } from "State";
  import { createEventDispatcher } from "svelte";

  export let icon: ConstructorOfATypedSvelteComponent;
  export let style = "";

  const dispatch = createEventDispatcher();
</script>

<div
  class="{$MobileLayout
    ? 'h-12 w-12'
    : 'h-8 w-8'} bg-inherit cursor-pointer flex items-center justify-center hover:brightness-90 active:brightness-75"
  {style}
  on:touchend|preventDefault={(e) => {
    if (e.shiftKey) dispatch("shiftclick", e);
    else dispatch("click", e);
  }}
  on:click|preventDefault={(e) => {
    if (e.shiftKey) dispatch("shiftclick", e);
    else dispatch("click", e);
  }}
>
  <svelte:component this={icon} />
</div>

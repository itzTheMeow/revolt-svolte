<script lang="ts">
  import { Theme } from "Theme";

  export let text = "";
  export let color = "";
  export let icon: ConstructorOfATypedSvelteComponent | null = null;

  $: {
    color = color || $Theme["accent"] || "inherit";
  }
</script>

<div
  class="rounded {text
    ? 'px-1'
    : 'px-0.5'} py-0.5 flex items-center justify-center select-none w-fit h-fit"
  style:background={color}
  style:font-size="0.65rem"
>
  {#if icon}
    <svelte:component this={icon} size={14} />
  {/if}
  {text}
</div>

<script lang="ts">
  import { MobileLayout } from "State";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";

  export let icon: ConstructorOfATypedSvelteComponent;
  export let tooltip: string;
  export let onclick: () => any;
  export let className = "";
  export let color = "inherit";
</script>

<div
  class="rounded-lg {$MobileLayout
    ? 'p-2'
    : 'p-1.5'} flex items-center gap-1.5 hover:brightness-50 transition cursor-pointer shadow-sm shadow-black {className}"
  style:background-color={$Theme["background"]}
  style:color
  use:tippy={{ content: tooltip }}
  on:click={() => onclick()}
>
  <svelte:component this={icon} size={$MobileLayout ? 26 : 24} />
</div>

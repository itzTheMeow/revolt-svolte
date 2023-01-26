<script lang="ts">
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";

  export let icon: ConstructorOfATypedSvelteComponent;
  export let tooltip: string;
</script>

<div
  class="rounded-lg p-1.5 flex items-center gap-1.5 hover:brightness-50 transition cursor-pointer"
  style:background-color={$Theme["background"]}
  use:tippy={{ content: tooltip }}
>
  <svelte:component this={icon} />
</div>

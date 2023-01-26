<script lang="ts">
  import { Theme } from "Theme";

  export let icon: ConstructorOfATypedSvelteComponent;
</script>

<div
  class="rounded-lg p-1.5 flex items-center gap-1.5 hover:brightness-50 transition cursor-pointer"
  style:background-color={$Theme["background"]}
>
  <svelte:component this={icon} />
</div>

<script lang="ts">
  import { Theme } from "Theme";

  export let large = false;
  export let className = "";
</script>

<div
  class="{large ? 'text-base' : 'text-xs'} uppercase font-bold {className}"
  style:color={$Theme["tertiary-foreground"]}
>
  <slot />
</div>

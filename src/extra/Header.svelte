<script lang="ts">
  import { Theme } from "Theme";

  export let large = false,
    className = "",
    lower = false;
</script>

<div
  class="{large ? 'text-base' : 'text-xs'} {!lower ? 'uppercase' : ''} font-bold {className}"
  style:color={$Theme["tertiary-foreground"]}
>
  <slot />
</div>

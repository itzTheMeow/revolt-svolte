<script lang="ts">
  import { Theme } from "Theme";

  export let text: string;
</script>

<div
  class="rounded px-1 py-0.5 flex items-center justify-center select-none"
  style:background-color={$Theme["accent"]}
  style:font-size="0.65rem"
>
  {text.toUpperCase()}
</div>

<script lang="ts">
  import { Theme } from "Theme";

  export let text: string;
  export let color = "";

  $: {
    color = color || $Theme["accent"] || "inherit";
  }
</script>

<div
  class="rounded px-1 py-0.5 flex items-center justify-center select-none w-fit h-fit"
  style:background={color}
  style:font-size="0.65rem"
>
  {text}
</div>

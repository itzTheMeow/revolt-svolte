<!-- Adapted from @bulatdashiev/svelte-slider on NPM. -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Theme } from "Theme";
  import tinycolor from "tinycolor2";
  import handle from "./handle";

  const dispatch = createEventDispatcher();

  let min = 0;
  export let max = 100;
  export let step = 1;
  export let value = min;
  export let className = "";

  function stepRound(v: number) {
    const offset = min % step,
      width = max - min;
    return Math.round((min + v * width - offset) / step) * step + offset;
  }
</script>

<div
  class="relative h-1.5 rounded-full cursor-pointer mx-1.5 my-1 {className}"
  style:background={tinycolor($Theme["accent"]).setAlpha(0.2).toRgbString()}
  use:handle={{
    drag(v) {
      value = stepRound(v);
      dispatch("change", value);
    },
    dragstart() {
      dispatch("dragstart");
    },
    dragend() {
      dispatch("dragend");
    },
  }}
>
  <div
    class="absolute top-0 left-0 h-full w-full rounded-full"
    style:background={$Theme["accent"]}
    style:width="{(value / (max - min)) * 100}%"
  />
  <div
    class="thumb absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-3 h-3 cursor-grab brightness-[.65]"
    style:left="{(value / (max - min)) * 100}%"
    style:background={$Theme["accent"]}
  />
</div>

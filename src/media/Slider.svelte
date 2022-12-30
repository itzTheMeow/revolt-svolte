<!-- Adapted from @bulatdashiev/svelte-slider on NPM. -->
<script>
  import { createEventDispatcher } from "svelte";
  import handle from "./handle";
  const dispatch = createEventDispatcher();

  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let value = [min, max];

  let pos,
    active = false;

  $: if (active) setValue(pos);
  $: if (!active) setPos(value);
  $: min, max, clamp();
  $: progress = `
    left: 0%;
    right: ${100 - Math.max(pos[0], pos[0]) * 100}%;
  `;
  function setValue(pos) {
    const offset = min % step;
    const width = max - min;
    value = pos
      .map((v) => min + v * width)
      .map((v) => Math.round((v - offset) / step) * step + offset);
    dispatch("input", value);
  }
  function setPos(value) {
    pos = value.map((v) => Math.min(Math.max(v, min), max)).map((v) => (v - min) / (max - min));
  }
  function clamp() {
    setPos(value);
    setValue(pos);
  }
</script>

<div class="track">
  <div class="progress" style={progress} />
  <div
    class="thumb"
    style={`left: ${pos[0] * 100}%;`}
    use:handle={{
      dragstart() {
        active = true;
      },
      drag(v) {
        pos[0] = v;
      },
      dragend() {
        active = false;
      },
    }}
  >
    <div class="thumb-content" class:active>
      <div class="thumb-item" />
    </div>
  </div>
</div>

<style>
  .track {
    margin: 16px 8px;
    position: relative;
    height: 4px;
    width: calc(100% - 16px);
    border-radius: 100vh;
    background: var(--track-bg, #ebebeb);
  }
  .progress {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 100vh;
    background: var(--progress-bg, #8abdff);
  }
  .thumb-item {
    width: 16px;
    height: 16px;
    border-radius: 100vh;
    background: var(--thumb-bg, #5784fd);
  }

  .thumb {
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
  }
  .thumb-content {
    position: relative;
    width: fit-content;
    height: fit-content;
    transform: translate(-50%, -50%);
  }
  .thumb-content::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    transform: translate(-25%, -25%) scale(0);
    border-radius: 100vh;
    background: var(--thumb-bg, #5784fd);
    opacity: 30%;
    transition: transform 100ms ease-in-out;
  }
  .thumb-content.active::before {
    transform: translate(-25%, -25%) scale(1);
  }
</style>

<!-- Adapted from @bulatdashiev/svelte-slider on NPM. -->
<script>
  import handle from "./handle";

  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let value = min;
</script>

<div class="track">
  <div class="progress" style:width="{(value / (max - min)) * 100}%" />
  <div
    class="thumb"
    style:left="{(value / (max - min)) * 100}%"
    use:handle={(v) => {
      const offset = min % step,
        width = max - min;
      value = Math.round((min + v * width - offset) / step) * step + offset;
    }}
  >
    <div class="thumb-content">
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
</style>

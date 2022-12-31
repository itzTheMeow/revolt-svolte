<script lang="ts">
  /* Shamelessly 'inspired' from https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp */

  import { client } from "Client";
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import { imagePreview } from "./ImagePreview";

  const zoomSettings = {
    default: 2.5,
    max: 7,
    min: 1.5,
    step: 0.5,
  };

  let preview: HTMLDivElement, image: HTMLImageElement, glass: HTMLDivElement;

  let imageURL: string,
    mouseDown = false,
    isMagnifying = false,
    magPos = { x: 0, y: 0 },
    zoom = zoomSettings.default,
    glassW = 0,
    glassH = 0;
  $: {
    if ($imagePreview) {
      imageURL = proxyURL(client.generateFileURL($imagePreview), "image");
      glassW = glass?.offsetWidth / 2;
      glassH = glass?.offsetHeight / 2;
    }
    if (!mouseDown) zoom = zoomSettings.default;
  }

  function calculatePos(e: MouseEvent) {
    if (!image) return;
    const rect = image.getBoundingClientRect();
    let x = e.pageX - rect.left,
      y = e.pageY - rect.top;
    if (x > image.width - glassW / zoom) x = image.width - glassW / zoom;
    if (x < glassW / zoom) x = glassW / zoom;
    if (y > image.height - glassH / zoom) y = image.height - glassH / zoom;
    if (y < glassH / zoom) y = glassH / zoom;
    magPos = { x, y };
  }
</script>

{#if $imagePreview}
  <div
    class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
    on:mouseup={(e) => {
      //@ts-ignore
      !preview.contains(e.target) && !mouseDown && imagePreview.set(null);
      mouseDown = isMagnifying = false;
    }}
  >
    <div class="h-fit w-fit" bind:this={preview}>
      <div class="w-fit h-fit relative overflow-hidden">
        <img
          bind:this={image}
          src={imageURL}
          alt={$imagePreview.filename}
          class="max-w-[90vw] max-h-[85vh] {isMagnifying
            ? 'brightness-75 cursor-none'
            : 'cursor-zoom-in'}"
          on:mousedown={(e) =>
            e.button == 0 && !$MobileLayout && (mouseDown = isMagnifying = true) && calculatePos(e)}
          on:mouseenter={(e) => !$MobileLayout && (isMagnifying = mouseDown) && calculatePos(e)}
          on:mouseleave={() => !$MobileLayout && (isMagnifying = false)}
          on:mousemove={calculatePos}
          on:wheel={(e) => {
            if (isMagnifying) {
              zoom = Math.max(
                zoomSettings.min,
                Math.min(zoomSettings.max, zoom + (e.deltaY < 0 ? 1 : -1) * zoomSettings.step)
              );
            }
          }}
        />
        {#if isMagnifying}
          <div
            class="absolute w-28 h-28 rounded-full pointer-events-none bg-no-repeat"
            style:border="2px solid {$Theme["accent"]}"
            style:left={magPos.x - glassW + "px"}
            style:top={magPos.y - glassH + "px"}
            style:background-image="url({imageURL})"
            style:background-position="-{magPos.x * zoom - glassW + zoom}px -{magPos.y * zoom -
              glassH +
              zoom}px"
            style:background-size="{image.width * zoom}px {image.height * zoom}px"
            bind:this={glass}
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

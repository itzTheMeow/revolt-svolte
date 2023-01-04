<script lang="ts">
  /* Shamelessly 'inspired' from https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp */

  import byteSize from "byte-size";
  import { MobileLayout } from "State";
  import { scale } from "svelte/transition";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import { imagePreview } from "./ImagePreview";

  const zoomSettings = {
    default: $MobileLayout ? 3.5 : 2.5,
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
      imageURL = proxyURL($imagePreview.generateURL(), "image");
      glassW = glass?.offsetWidth / 2;
      glassH = glass?.offsetHeight / 2;
    }
    if (!mouseDown) zoom = zoomSettings.default;
  }

  function calculatePos(e: MouseEvent | TouchEvent) {
    if (!image) return;
    const rect = image.getBoundingClientRect();
    let x = (e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX) - rect.left,
      y = (e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY) - rect.top;
    if (x > image.width - glassW / zoom) x = image.width - glassW / zoom;
    if (x < glassW / zoom) x = glassW / zoom;
    if (y > image.height - glassH / zoom) y = image.height - glassH / zoom;
    if (y < glassH / zoom) y = glassH / zoom;
    magPos = { x, y };
  }
</script>

{#if $imagePreview && $imagePreview.metadata.type == "Image"}
  <div
    class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center"
    on:mouseup={(e) => {
      //@ts-ignore
      !preview.contains(e.target) && !mouseDown && imagePreview.set(null);
      mouseDown = isMagnifying = false;
    }}
    out:scale|local={{ duration: 100 }}
  >
    <div
      class="flex flex-col items-center w-fit h-fit"
      bind:this={preview}
      in:scale|local={{ duration: 300, start: 0.4 }}
    >
      <div class="w-fit h-fit relative">
        <img
          bind:this={image}
          src={imageURL}
          alt={$imagePreview.name}
          class="max-w-[90vw] max-h-[85vh] {isMagnifying
            ? 'brightness-75 cursor-none'
            : 'cursor-zoom-in'}"
          on:mousedown={(e) =>
            e.button == 0 && (mouseDown = isMagnifying = true) && calculatePos(e)}
          on:mouseenter={(e) => (isMagnifying = mouseDown) && calculatePos(e)}
          on:mouseleave={() => (isMagnifying = false)}
          on:mousemove={calculatePos}
          on:touchstart|preventDefault={(e) => (mouseDown = isMagnifying = true) && calculatePos(e)}
          on:touchend|preventDefault={() => (isMagnifying = false)}
          on:touchmove|preventDefault={calculatePos}
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
            class="absolute {$MobileLayout
              ? 'w-56 h-56'
              : 'w-28 h-28'} rounded-full pointer-events-none bg-no-repeat"
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
      <div
        class="text-xs font-semibold flex items-center gap-1 mt-0.5"
        style:color={$Theme["tertiary-foreground"]}
      >
        <div>{$imagePreview.name}</div>
        &bull;
        <div>{$imagePreview.metadata.width}x{$imagePreview.metadata.height}</div>
        &bull;
        <div>{byteSize($imagePreview.size).toString().toUpperCase()}</div>
        &bull;
        <a class="hover:underline" href={$imagePreview.generateURL()} target="_blank">
          Open Original
        </a>
        &bull;
        <a class="hover:underline" href={$imagePreview.generateDownloadURL()} target="_blank">
          Download
        </a>
      </div>
    </div>
  </div>
{/if}

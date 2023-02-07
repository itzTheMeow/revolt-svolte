<script lang="ts">
  import Cropper from "svelte-easy-crop";
  import type { CropArea } from "svelte-easy-crop/types";
  import { Theme } from "Theme";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";

  export let modal: Extract<ModalData, { type: "crop" }>;
  let item: Modal;

  let crop = { x: 0, y: 0 },
    zoom = 1,
    image = "",
    pixels: CropArea;
  $: {
    if (image) URL.revokeObjectURL(image);
    image = URL.createObjectURL(modal.file);
  }

  /** Stolen from the package */
  async function finishCrop() {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.addEventListener("load", () => resolve(i));
      i.addEventListener("error", (error) => reject(error));
      i.src = image;
    });
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");

    if (!ctx) return null;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(pixels.x, pixels.y, pixels.width, pixels.height);
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    ctx.putImageData(data, 0, 0);

    const file = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!file) modal.canceled?.();
    else modal.done?.(new File([file], modal.file.name));
    item.close();
  }
</script>

<ModalBase {modal} bind:item on:cancel={() => modal.canceled?.()} className="w-fit" noClickOut>
  <div class="relative w-80 h-80 rounded overflow-hidden mx-auto">
    <Cropper
      {image}
      aspect={1}
      bind:crop
      bind:zoom
      showGrid={false}
      cropShape="round"
      zoomSpeed={0.5}
      on:cropcomplete={(e) => (pixels = e.detail.pixels)}
    />
  </div>
  <div class="modal-action w-full mt-4">
    <div
      class="btn btn-sm border-none text-inherit"
      style:background-color={$Theme["accent"]}
      style:color={$Theme["secondary-background"]}
      on:click={finishCrop}
    >
      Done
    </div>
    <div
      class="btn btn-sm border-none text-inherit"
      style:background-color={$Theme["secondary-background"]}
      on:click={() => {
        modal.canceled?.();
        item.close();
      }}
    >
      Cancel
    </div>
    <div
      class="btn btn-sm border-none text-inherit !ml-auto"
      style:background-color={$Theme["secondary-background"]}
      on:click={() => {
        modal.done?.(modal.file);
        item.close();
      }}
    >
      Skip
    </div>
  </div>
</ModalBase>

<style>
  :global(.container .cropperArea[class*="svelte-"].round) {
    border-width: 2px;
    border-color: var(--accent);
  }
</style>

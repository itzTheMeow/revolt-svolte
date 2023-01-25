<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { scale } from "svelte/transition";
  import { Theme } from "Theme";
  import { ModalStack, type Modal, type ModalData } from "./ModalStack";

  const dispatch = createEventDispatcher();

  export let modal: ModalData;
  export let className = "";
  export let full = false;
  export const item: Modal = {
    close() {
      ModalStack.close(modal);
    },
  };
</script>

<div
  class="modal modal-open bg-black bg-opacity-0"
  style:transition="200ms background"
  on:click={(e) =>
    //@ts-ignore
    e.target.classList.contains("modal") && (dispatch("cancel"), item.close())}
>
  <div
    class="modal-box relative {full
      ? 'w-full h-full rounded-none max-w-full max-h-full'
      : ''} {className}"
    style:background-color={$Theme["background"]}
    in:scale={{ duration: 200, start: 0.3 }}
    on:introstart={(e) => {
      if (!full) e.currentTarget.parentElement?.classList.add("bg-opacity-70");
    }}
    out:scale={{ duration: 200 }}
    on:outrostart={(e) => {
      e.currentTarget.parentElement?.classList.remove("bg-opacity-70");
    }}
  >
    <slot />
  </div>
</div>

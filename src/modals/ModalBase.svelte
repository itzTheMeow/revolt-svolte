<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Theme } from "Theme";
  import { ModalStack, type Modal, type ModalData } from "./ModalStack";

  const dispatch = createEventDispatcher();

  export let modal: ModalData;
  export const item: Modal = {
    close() {
      ModalStack.close(modal);
    },
  };
</script>

<div
  class="modal modal-open"
  on:click={(e) =>
    //@ts-ignore
    e.target.classList.contains("modal") && (dispatch("cancel"), item.close())}
>
  <div class="modal-box" style:background-color={$Theme["background"]}>
    <slot />
  </div>
</div>

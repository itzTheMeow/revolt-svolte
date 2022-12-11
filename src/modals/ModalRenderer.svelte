<script lang="ts">
  import ConfirmModal from "./ConfirmModal.svelte";
  import { ModalStack, type ModalData } from "./ModalStack";

  let stack: ModalData[] = [];
  ModalStack.stack.subscribe((s) => {
    stack = s;
  });
</script>

{#each stack as modal}
  {#if modal.type == "confirm"}
    <ConfirmModal {modal} />
  {/if}
{/each}

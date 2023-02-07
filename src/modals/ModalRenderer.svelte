<script lang="ts">
  import ConfirmModal from "./ConfirmModal.svelte";
  import CropModal from "./CropModal.svelte";
  import MarkdownModal from "./MarkdownModal.svelte";
  import { ModalStack, type ModalData } from "./ModalStack";
  import ServerSettingsModal from "./ServerSettingsModal.svelte";
  import UserModal from "./UserModal.svelte";

  let stack: ModalData[] = [];
  ModalStack.stack.subscribe((s) => {
    stack = s;
  });
</script>

{#each stack as modal (modal)}
  {#if modal.type == "confirm"}
    <ConfirmModal {modal} />
  {:else if modal.type == "user"}
    <UserModal {modal} />
  {:else if modal.type == "markdown"}
    <MarkdownModal {modal} />
  {:else if modal.type == "settings_server"}
    <ServerSettingsModal {modal} />
  {:else if modal.type == "crop"}
    <CropModal {modal} />
  {/if}
{/each}

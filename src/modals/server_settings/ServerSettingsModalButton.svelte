<script lang="ts">
  import { Theme } from "Theme";
  import { ModalStack, type ModalData } from "../ModalStack";
  import { SettingsServerPage } from "../Settings";

  export let category: SettingsServerPage,
    icon: ConstructorOfATypedSvelteComponent,
    modal: Extract<ModalData, { type: "settings_server" }>;
</script>

<div
  class="flex items-center cursor-pointer px-3 py-2 w-full rounded-md gap-1 hover:bg-[var(--hov)] transition"
  on:click={() => ((modal.page = category), ModalStack.update())}
  style:background={modal.page == category ? $Theme["hover"] : ""}
  style:--hov={$Theme["hover"]}
>
  <svelte:component this={icon} size={18} />
  <div>{SettingsServerPage[category]}</div>
</div>

<script lang="ts">
  import { Theme } from "Theme";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";
ck";

  export let modal: Extract<ModalData, { type: "confirm" }>;
  let item: Modal, confirmer: HTMLDivElement;
</script>

<ModalBase
	{modal}
	bind:item
	on:cancel={() => {
		modal.canceled?.();
	}}
>
	<div class="font-semibold text-lg">{modal.title}</div>
	<div class="py-4">
		{modal.text}
	</div>
	<div class="modal-action justify-start">
		<div
			class="btn border-none text-inherit"
			bind:this={confirmer}
			style:background-color={$Theme[modal.red ? "error" : "accent"]}
			on:click={async () => {
				confirmer.classList.add("loading");
				await modal.confirmed?.();
				item.close();
				confirmer.classList.remove("loading");
			}}
		>
			{modal.confirm || "Confirm"}
		</div>
		<div
			class="btn border-none text-inherit"
			style:background-color={$Theme["secondary-background"]}
			on:click={() => {
				modal.canceled?.();
				item.close();
			}}
		>
			{modal.cancel || "Cancel"}
		</div>
	</div>
</ModalBase>

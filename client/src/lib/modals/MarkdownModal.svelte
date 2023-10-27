<script lang="ts">
	import { Theme } from "$lib/Theme";
	import Markdown from "../markdown/Markdown.svelte";
	import ModalBase from "./ModalBase.svelte";
	import type { Modal, ModalData } from "./ModalStack";

	export let modal: Extract<ModalData, { type: "markdown" }>;
	let item: Modal;
</script>

<ModalBase {modal} bind:item>
	{#if modal.title}
		<div class="font-semibold text-lg">{modal.title}</div>
	{/if}
	<Markdown text={modal.content} />
	<div class="modal-action justify-start mt-4">
		<div
			class="btn border-none text-inherit px-6"
			style:background-color={$Theme["secondary-background"]}
			on:click={() => item.close()}
		>
			OK
		</div>
	</div>
</ModalBase>

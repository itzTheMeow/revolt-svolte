<script lang="ts">
	import { tippy } from "svelte-tippy";

	export let placeholder = false;
	export let onclick: () => any;
	export let tooltip: string = "";
	export let className = "";
</script>

<div
	class="avatar {placeholder
		? 'placeholder'
		: ''} cursor-pointer box-border rounded-full w-12 h-12 relative {className}"
	on:click={onclick}
	use:tippy={{
		placement: "right",
		content: tooltip,
		onShow() {
			if (!tooltip) return false;
		},
	}}
>
	<slot />
</div>

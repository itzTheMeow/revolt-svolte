<script lang="ts">
	import { Theme } from "$lib/Theme";

	export let value = "",
		rows = 0,
		className = "";
</script>

{#if !rows}
	<input
		class="rounded-md px-4 py-3 w-full transition-[outline] [outline:2px_solid_transparent] -outline-offset-2 {className}"
		style:background={$Theme["secondary-background"]}
		bind:value
	/>
{:else}
	<textarea
		class="rounded-md px-4 py-3 w-full transition-[outline] [outline:2px_solid_transparent] -outline-offset-2 resize-none {className}"
		style:background={$Theme["secondary-background"]}
		{rows}
		bind:value
	/>
{/if}

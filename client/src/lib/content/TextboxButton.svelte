<script lang="ts">
	import { Theme } from "$lib/Theme";
	import type { Message } from "revkit";
	import tinycolor from "tinycolor2";

	export let color: string | undefined,
		icon: ConstructorOfATypedSvelteComponent,
		onclick: (event: MouseEvent | TouchEvent) => any,
		standalone: boolean | Message | null;

	export let button: HTMLDivElement = <any>undefined;
</script>

<div
	class="btn btn-square btn-primary rounded-none border-none h-12 {standalone
		? 'mb-auto'
		: 'mt-auto'}"
	style:background-color={color}
	style:color={tinycolor(color).isDark() ? $Theme["foreground"] : $Theme["background"]}
	bind:this={button}
	on:click={onclick}
	on:touchend|preventDefault={onclick}
>
	<svelte:component this={icon} />
</div>

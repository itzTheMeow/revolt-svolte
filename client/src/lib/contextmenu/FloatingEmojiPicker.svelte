<script lang="ts">
	import { client } from "$lib/Client";
	import { MobileLayout } from "$lib/State";
	import { Theme } from "$lib/Theme";
	import VirtualList from "extra/VirtualList.svelte";
	import { RevoltEmojiLib, type AnyEmoji } from "revkit";
	import { OrderedServers } from "state/orderedServers";
	import { onDestroy, onMount } from "svelte";
	import tinycolor from "tinycolor2";
	import { floatingMenu } from "./FloatingMenu";

	export let targetInput: HTMLInputElement | HTMLTextAreaElement, cursorPos: number;

	let perPage = 0,
		unit = "vh";
	$: perPage = 8;
	$: unit = $MobileLayout ? "vw" : "vh";

	let state = Date.now();
	function update() {
		state = Date.now();
	}
	onMount(() => client.emojis.onUpdate(update));
	onDestroy(() => client.emojis.offUpdate(update));
	$: state += perPage;

	let emojiList: { id: string; name: string; icon?: string; emojis: AnyEmoji[] }[] = [],
		emojiChunks: (Omit<(typeof emojiList)[0], "emojis"> | (AnyEmoji | string)[])[] = [];
	$: emojiList = [
		...$OrderedServers
			.filter((s) => s.emojis.size)
			.map((s) => ({
				id: s.id,
				name: s.name,
				icon: s.generateIconURL({ max_side: 64 }),
				emojis: s.emojis.items(),
			})),
		{ id: "0", name: "Default Emojis", emojis: RevoltEmojiLib.map((e) => e.setPack("twemoji")) },
	];
	$: emojiChunks = emojiList.reduce<typeof emojiChunks>((cats, cat) => {
		cats.push({ id: cat.id, name: cat.name, icon: cat.icon });
		const emojis = [...cat.emojis];
		while (emojis.length) {
			cats.push(emojis.splice(0, perPage));
		}
		return cats;
	}, []);
</script>

{#key state}
	<div
		class="flex flex-col py-2"
		style:height={$MobileLayout ? "50vh" : "60vh"}
		style:width={$MobileLayout ? "100%" : "60vh"}
	>
		<VirtualList className="px-2" items={emojiChunks} let:item={cat}>
			{#if !Array.isArray(cat)}
				<div class="uppercase font-semibold text-xs flex mb-2">
					{cat.name}
				</div>
			{:else}
				<div class="flex gap-1 mb-1">
					{#each cat as emoji}
						<div
							class="p-1 rounded cursor-pointer hover:bg-[var(--hv)]"
							style:--hv={tinycolor($Theme["accent"]).setAlpha(0.2).toRgbString()}
							style:width="{(($MobileLayout ? 100 : 60) - perPage) * (1 / perPage)}{unit}"
							style:height="{(($MobileLayout ? 100 : 60) - perPage) * (1 / perPage)}{unit}"
							on:click={() => {
								floatingMenu.set(null);
								if (!targetInput) return;
								targetInput.focus();
								const str = emoji.toString().replace(emoji.id, emoji.uniqueName);
								targetInput.value =
									targetInput.value.slice(0, cursorPos) + str + targetInput.value.slice(cursorPos);
								targetInput.selectionStart = targetInput.selectionEnd = cursorPos + str.length;
							}}
						>
							<img
								class="w-full h-full object-contain"
								loading="lazy"
								src={emoji.imageURL}
								alt=":{emoji.id}:"
							/>
						</div>
					{/each}
				</div>
			{/if}
		</VirtualList>
	</div>
{/key}

<script lang="ts">
  import { IconChevronDown, IconChevronLeft } from "@tabler/icons-svelte";
  import { client } from "Client";
  import { CollapsedEmojiCategories } from "State";
  import { Theme } from "Theme";
  import VirtualList from "extra/VirtualList.svelte";
  import { RevoltEmojiLib, type AnyEmoji } from "revkit";
  import { OrderedServers } from "state/orderedServers";
  import { onDestroy, onMount } from "svelte";
  import tinycolor from "tinycolor2";

  let perPage = 0;
  $: perPage = 8;

  let state = Date.now();
  function update() {
    state = Date.now();
  }
  onMount(() => client.emojis.onUpdate(update));
  onDestroy(() => client.emojis.offUpdate(update));

  let emojiList: { id: string; name: string; icon?: string; emojis: AnyEmoji[] }[] = [],
    emojiChunks: (Omit<(typeof emojiList)[0], "emojis"> | AnyEmoji[])[] = [];
  $: emojiList = [
    ...$OrderedServers
      .filter((s) => s.emojis.size)
      .map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.generateIconURL({ max_side: 64 }),
        emojis: s.emojis.items(),
      })),
    { id: "0", name: "Default Emojis", emojis: RevoltEmojiLib },
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
  <div class="flex flex-col h-[50vw] w-[50vh] max-h-[inherit]">
    <VirtualList className="" items={emojiChunks} let:item={cat}>
      {#if !Array.isArray(cat)}
        <div
          class="uppercase font-semibold text-xs flex cursor-pointer hover:brightness-90"
          on:click={() => {
            const i = $CollapsedEmojiCategories.indexOf(cat.id);
            if (i >= 0) $CollapsedEmojiCategories.splice(i, 1);
            else $CollapsedEmojiCategories.push(cat.id);
          }}
        >
          <span class="mr-auto">{cat.name}</span>
          {#if $CollapsedEmojiCategories.includes(cat.id)}
            <IconChevronLeft size={16} />
          {:else}
            <IconChevronDown size={16} />
          {/if}
        </div>
      {:else}
        <div class="flex gap-1">
          {#each cat as emoji}
            <div
              class="p-0.5 aspect-square rounded-sm cursor-pointer hover:bg-[var(--hv)]"
              style:--hv={tinycolor($Theme["accent"]).setAlpha(0.2).toRgbString()}
              style:width="{100 * (1 / perPage)}%"
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

<script lang="ts">
  import { IconHash, IconHome, IconNotebook, IconUsers, IconVolume } from "@tabler/icons-svelte";
  import type { Channel } from "revolt-toolset";
  import { proxyURL } from "utils";

  export let channel: Channel;
  export let size = 20;
</script>

{#if channel.icon || channel.isDM()}
  <img
    src={proxyURL(
      channel.isDM()
        ? channel.recipient?.generateAvatarURL({
            max_side: 64,
          })
        : channel.generateIconURL({
            max_side: 64,
          }),
      "image"
    )}
    width={size}
    height={size}
    class="object-cover aspect-square {channel.isDMBased() ? 'rounded-full' : ''}"
    alt=""
  />
{:else if channel.isGroupDM()}
  <IconUsers {size} />
{:else if channel.isText()}
  <IconHash {size} />
{:else if channel.isVoice()}
  <IconVolume {size} />
{:else if channel.isSavedMessages()}
  <IconNotebook {size} />
{:else}
  <IconHome {size} />
{/if}

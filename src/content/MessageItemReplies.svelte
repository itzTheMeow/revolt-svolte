<script lang="ts">
  import type { Message } from "revolt-toolset";
  import { MessageCache } from "State";
  import { writable } from "svelte/store";
  import { CornerLeftDown } from "tabler-icons-svelte";
  import { MessageDetails, proxyURL } from "utils";

  export let message: Message;

  let replies = writable<(Message | undefined)[]>([]);
  $: replies.set(
    message.reply_ids?.map((i, ii) => {
      const cached = $MessageCache[message.channel_id].find((m) => m.id == i);
      if (!cached) {
        message.channel?.fetchMessage(i).then((m) => {
          replies.update((repl) => {
            repl[ii] = m;
            return repl;
          });
        });
      }
      return cached;
    }) || []
  );
</script>

<div class="mt-3 -mb-2.5 pl-1.5">
  {#each $replies.sort((r1, r2) => (r1?.createdAt || 0) - (r2?.createdAt || 0)) as reply}
    <div class="flex gap-2 items-center">
      <CornerLeftDown size={18} />
      <img
        class="w-4 h-4 rounded-full -ml-1"
        src={reply
          ? MessageDetails(reply).avatar
          : proxyURL(
              `https://api.revolt.chat/users/${
                message.reply_ids?.[$replies.indexOf(reply)]
              }/default_avatar`,
              "image"
            )}
        alt=""
      />
      <div style="color:{reply ? MessageDetails(reply).color || 'inherit' : 'inherit'};">
        {reply ? MessageDetails(reply).name : "Unknown User"}
      </div>
      <div class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
        {#if !reply}
          ...
        {:else if reply.content}
          {reply.content.slice(0, 200)}
        {:else}<i>Sent an Attachment</i>{/if}
      </div>
    </div>
  {/each}
</div>

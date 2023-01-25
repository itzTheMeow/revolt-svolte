<script lang="ts">
  import { IconCornerLeftDown } from "@tabler/icons-svelte";
  import { floatingMenu, showMemberContext } from "contextmenu/FloatingMenu";
  import Markdown from "markdown/Markdown.svelte";
  import { ModalStack } from "modals/ModalStack";
  import type { BaseMessage, Message } from "revolt-toolset";
  import { MessageCache } from "State";
  import { writable } from "svelte/store";
  import { MessageDetails, proxyURL } from "utils";

  export let message: Message;

  let replies = writable<(BaseMessage | undefined)[]>([]);
  $: replies.set(
    message.replyIDs?.map((i, ii) => {
      const cached = $MessageCache[message.channelID].find((m) => m.id == i);
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
  {#each $replies.sort((r1, r2) => (r1?.createdAt || 0) - (r2?.createdAt || 0)) as reply (reply?.id)}
    {#if reply?.isUser()}
      <div class="flex gap-2 items-center">
        <IconCornerLeftDown size={18} />
        <div
          class="cursor-pointer flex gap-2 items-center text-[14px] hover:[--u:underline]"
          data-clickable
          on:click={(e) => {
            if (!reply?.isUser()) return;
            if (reply.member) showMemberContext(reply.member, e.clientX, e.clientY, e.target);
            else ModalStack.push({ type: "user", id: reply.authorID });
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          on:dblclick={(e) => {
            if ($floatingMenu) floatingMenu.set(null);
            ModalStack.push({ type: "user", id: message.authorID });
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          <img
            class="w-4 h-4 rounded-full -ml-1"
            src={reply
              ? MessageDetails(reply).avatar
              : proxyURL(
                  `https://api.revolt.chat/users/${
                    message.replyIDs?.[$replies.indexOf(reply)]
                  }/default_avatar`,
                  "image"
                )}
            alt=""
          />
          <div
            class="[text-decoration-line:var(--u)]"
            style:color={reply ? MessageDetails(reply).color || "inherit" : "inherit"}
          >
            {message.mentionIDs.includes(reply.authorID) ? "@" : ""}{reply
              ? MessageDetails(reply).name
              : "Unknown User"}
          </div>
        </div>
        <div
          class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap cursor-pointer"
          data-clickable
        >
          {#if !reply}
            ...
          {:else if reply.content}
            <Markdown text={reply.content} line noPointer />
          {:else}
            <i>Sent an Attachment</i>
          {/if}
        </div>
      </div>
    {/if}
  {/each}
</div>

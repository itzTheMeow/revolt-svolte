<script lang="ts">
  import { showMemberContext } from "contextmenu/MemberContextMenu";
  import UserTag from "extra/UserTag.svelte";
  import { ModalStack } from "modals/ModalStack";
  import type { Message } from "revolt-toolset";
  import { Theme } from "Theme";
  import { MessageDetails, UserColor } from "utils";

  export let message: Message;
</script>

<div class="flex items-center gap-1.5 -mb-0.5" style:line-height="1.1">
  <div
    class="font-semibold cursor-pointer hover:underline"
    style={UserColor(MessageDetails(message).color || "inherit")}
    data-clickable
    on:click={(e) => {
      if (message.member) showMemberContext(message.member, e.clientX, e.clientY, e.target);
      else ModalStack.push({ type: "user", id: message.authorID });
      e.preventDefault();
      e.stopPropagation();
      return false;
    }}
  >
    {MessageDetails(message).name}
  </div>
  {#if message.masquerade}
    <UserTag
      text={message.author?.bot ? "BRIDGE" : `MASKED @${message.author?.username || "MASKED"}`}
    />
  {:else if message.author?.bot}
    <UserTag text="BOT" />
  {/if}
  <div class="text-xs" style:color={$Theme["tertiary-foreground"]}>
    {MessageDetails(message).time}
  </div>
</div>

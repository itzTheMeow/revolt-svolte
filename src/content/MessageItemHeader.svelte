<script lang="ts">
  import { floatingMenu, showMemberContext } from "contextmenu/FloatingMenu";
  import UserTag from "extra/UserTag.svelte";
  import { DateTime } from "luxon";
  import { ModalStack } from "modals/ModalStack";
  import type { Message } from "revolt-toolset";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";
  import { FULL_DATE_FORMAT, MessageDetails, UserColor } from "utils";

  export let message: Message;
</script>

<div class="flex items-center gap-1.5" style:line-height="1.1">
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
    on:dblclick={(e) => {
      if ($floatingMenu) floatingMenu.set(null);
      ModalStack.push({ type: "user", id: message.authorID });
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
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
  <div class="text-xs cursor-default" style:color={$Theme["tertiary-foreground"]}>
    <span
      use:tippy={{ content: DateTime.fromMillis(message.createdAt).toFormat(FULL_DATE_FORMAT) }}
    >
      {MessageDetails(message).time}
    </span>
    {#if message.edited}
      <span
        use:tippy={{
          content: "Edited " + DateTime.fromJSDate(message.edited).toFormat(FULL_DATE_FORMAT),
        }}
      >
        (edited)
      </span>
    {/if}
  </div>
</div>

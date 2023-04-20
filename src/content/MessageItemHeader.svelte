<script lang="ts">
  import { IconLink, IconRobot, IconSpy } from "@tabler/icons-svelte";
  import { floatingMenu, showMemberContext } from "contextmenu/FloatingMenu";
  import { DateTime } from "luxon";
  import { ModalStack } from "modals/ModalStack";
  import type { Message } from "revkit";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";
  import { FULL_DATE_FORMAT, MessageDetails, UserColor } from "utils";

  export let message: Message;
</script>

<div class="flex items-center gap-1" style:line-height="1.1">
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
    <div
      use:tippy={{
        content: message.author?.bot
          ? "Bridged message."
          : `Masked from @${message.author?.username}`,
      }}
    >
      <svelte:component
        this={message.author?.bot ? IconLink : IconSpy}
        size={16}
        color={$Theme["accent"]}
      />
    </div>
  {:else if message.author?.bot}
    <div
      use:tippy={{
        content: "Bot",
      }}
    >
      <IconRobot size={16} color={$Theme["accent"]} />
    </div>
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

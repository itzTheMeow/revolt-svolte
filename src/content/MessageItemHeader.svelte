<script lang="ts">
  import { CMState } from "contextmenu/ContextMenuState";
  import { ModalStack } from "modals/ModalStack";
  import type { Message } from "revolt.js";
  import { Theme } from "Theme";
  import { MessageDetails, UserColor } from "utils";

  export let message: Message;
</script>

<div class="flex items-center gap-1.5 -mb-0.5" style:line-height="1.1">
  <div
    class="font-semibold cursor-pointer hover:underline"
    style={UserColor(MessageDetails(message).color || "inherit")}
    on:click={(e) => {
      if (message.member)
        CMState.set({
          type: "member",
          member: message.member,
          pos: {
            top: e.clientY,
            left: e.clientX,
          },
          target: e.target,
        });
      else ModalStack.push({ type: "user", id: message.author_id });
      return false;
    }}
  >
    {MessageDetails(message).name}
  </div>
  {#if message.author?.bot}
    <div
      class="rounded px-1 py-0.5 flex items-center justify-center"
      style:background-color={$Theme["accent"]}
      style:font-size="0.65rem"
    >
      {message.masquerade ? "BRIDGE" : "BOT"}
    </div>
  {/if}
  <div class="text-xs" style:color={$Theme["tertiary-foreground"]}>
    {MessageDetails(message).time}
  </div>
</div>

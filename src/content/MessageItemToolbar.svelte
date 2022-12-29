<script lang="ts">
  import { client } from "Client";
  import { ModalStack } from "modals/ModalStack";
  import type { Message } from "revolt.js";
  import { MobileLayout, selectBottom, spliceMessages, updateReplies } from "State";
  import { CornerUpLeft, Trash } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import MessageItemToolbarItem from "./MessageItemToolbarItem.svelte";

  export let message: Message;
</script>

<div
  class="absolute {$MobileLayout ? '-top-6 right-5 h-12' : '-top-4 right-3 h-8'} flex rounded-lg"
  data-hover-item
  style="background-color:{$Theme['primary-header']};"
>
  <MessageItemToolbarItem
    icon={CornerUpLeft}
    on:click={() => {
      updateReplies(message);
      selectBottom();
    }}
  />
  {#if message.channel?.havePermission("ManageMessages") || message.author_id == client.user?._id}
    <MessageItemToolbarItem
      icon={Trash}
      on:click={() => {
        ModalStack.push({
          type: "confirm",
          title: "Delete Message",
          text: "Are you sure you want to delete this message?",
          confirm: "Delete",
          red: true,
          confirmed: async () => {
            await message.delete();
          },
        });
      }}
      on:shiftclick={() => {
        if (!message.channel) return;
        spliceMessages(message.channel, [message]);
        message.delete();
      }}
      style="color:{$Theme['error']};"
    />
  {/if}
</div>

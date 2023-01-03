<script lang="ts">
  import { client } from "Client";
  import { ModalStack } from "modals/ModalStack";
  import { BaseMessage, Permissions } from "revolt-toolset";
  import { MobileLayout, selectBottom, spliceMessages, updateReplies } from "State";
  import { CornerUpLeft, Trash } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import MessageItemToolbarItem from "./MessageItemToolbarItem.svelte";

  export let message: BaseMessage;
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
  {#if message.channel?.permissions.has(Permissions.ManageMessages) || (message.isUser() && message.authorID == client.user?.id)}
    <MessageItemToolbarItem
      icon={Trash}
      on:click={() => {
        ModalStack.push({
          type: "confirm",
          title: "Delete Message",
          text: "Are you sure you want to delete this message?",
          confirm: "Delete",
          red: true,
          async confirmed() {
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

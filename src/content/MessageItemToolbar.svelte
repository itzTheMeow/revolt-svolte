<script lang="ts">
  import { IconCornerUpLeft, IconEdit, IconTrash } from "@tabler/icons-svelte";
  import { client } from "Client";
  import { ModalStack } from "modals/ModalStack";
  import { BaseMessage, Permissions } from "revolt-toolset";
  import { isEditing, MobileLayout, selectBottom, spliceMessages, updateReplies } from "State";
  import { Theme } from "Theme";
  import MessageItemToolbarItem from "./MessageItemToolbarItem.svelte";

  export let message: BaseMessage;
</script>

<div
  class="absolute {$MobileLayout
    ? '-top-6 right-5 h-12'
    : '-top-4 right-3 h-8'} flex rounded-lg overflow-hidden"
  data-hover-item
  style:background={$Theme["primary-header"]}
>
  <MessageItemToolbarItem
    icon={IconCornerUpLeft}
    on:click={() => {
      updateReplies(message);
      selectBottom();
    }}
    title="Reply"
  />
  {#if message.isUser() && message.authorID == client.user?.id}
    <MessageItemToolbarItem
      icon={IconEdit}
      on:click={() => isEditing.set(message.id)}
      title="Edit"
    />
  {/if}
  {#if message.channel?.permissions.has(Permissions.ManageMessages) || (message.isUser() && message.authorID == client.user?.id)}
    <MessageItemToolbarItem
      icon={IconTrash}
      on:click={() => ModalStack.showDeleteModal(message)}
      on:shiftclick={() => {
        if (!message.channel) return;
        spliceMessages(message.channel, [message]);
        message.delete();
      }}
      style="color:{$Theme['error']};"
      title="Delete"
    />
  {/if}
</div>

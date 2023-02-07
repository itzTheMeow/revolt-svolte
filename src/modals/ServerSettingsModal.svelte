<script lang="ts">
  import {
    IconGavel,
    IconIdBadge2,
    IconInfoCircle,
    IconList,
    IconMail,
    IconMoodSmile,
    IconUsers,
    IconX,
  } from "@tabler/icons-svelte";
  import Header from "extra/Header.svelte";
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";
  import ServerSettingsModalButton from "./ServerSettingsModalButton.svelte";
  import ServerSettingsModalOverview from "./ServerSettingsModalOverview.svelte";
  import { SettingsServerPage } from "./Settings";

  export let modal: Extract<ModalData, { type: "settings_server" }>;
  let item: Modal;
</script>

<ModalBase {modal} bind:item full>
  <div class="flex w-full max-w-5xl mx-auto gap-5 {!$MobileLayout ? 'my-8' : ''}">
    <div
      class="flex flex-col gap-1 p-6 rounded-lg w-56"
      style:background={$Theme["secondary-background"]}
    >
      <div class="text-lg font-semibold">{modal.server.name}</div>
      <ServerSettingsModalButton
        category={SettingsServerPage.Overview}
        icon={IconInfoCircle}
        {modal}
      />
      <ServerSettingsModalButton category={SettingsServerPage.Channels} icon={IconList} {modal} />
      <ServerSettingsModalButton category={SettingsServerPage.Roles} icon={IconIdBadge2} {modal} />
      <Header className="mb-1 mt-0.5">Customization</Header>
      <ServerSettingsModalButton
        category={SettingsServerPage.Emojis}
        icon={IconMoodSmile}
        {modal}
      />
      <Header className="mb-1 mt-0.5">Moderation</Header>
      <ServerSettingsModalButton category={SettingsServerPage.Members} icon={IconUsers} {modal} />
      <ServerSettingsModalButton category={SettingsServerPage.Invites} icon={IconMail} {modal} />
      <ServerSettingsModalButton category={SettingsServerPage.Bans} icon={IconGavel} {modal} />
    </div>
    <div class="flex-1">
      {#if modal.page == SettingsServerPage.Overview}
        <ServerSettingsModalOverview server={modal.server} />
      {/if}
    </div>
    <div
      class="rounded-full p-2 cursor-pointer h-fit"
      style:border="3px solid {$Theme["tertiary-background"]}"
      on:click={() => item.close()}
    >
      <IconX size={20} />
    </div>
  </div>
</ModalBase>

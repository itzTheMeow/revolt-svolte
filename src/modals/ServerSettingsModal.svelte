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
  import { ServerSettingsChanges, SettingsServerPage } from "./Settings";

  export let modal: Extract<ModalData, { type: "settings_server" }>;
  let item: Modal;
</script>

<ModalBase {modal} bind:item full>
  <div class="flex w-full max-w-5xl mx-auto gap-6 {!$MobileLayout ? 'my-8' : ''}">
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
      <div class="flex mb-3 gap-1 items-center">
        <h1 class="mr-3">{SettingsServerPage[modal.page]}</h1>
        {#if $ServerSettingsChanges}
          <div
            class="btn btn-sm border-none font-bold"
            style:background-color={$Theme["success"]}
            style:color={$Theme["background"]}
            on:click={async (e) => {
              if (!$ServerSettingsChanges) return;
              //@ts-ignore
              e.target.classList.add("loading");
              await $ServerSettingsChanges.save();
              //@ts-ignore
              e.target.classList.remove("loading");
              ServerSettingsChanges.set(null);
            }}
          >
            Save
          </div>
          <div
            class="btn btn-sm border-none font-bold"
            style:background-color={$Theme["error"]}
            style:color={$Theme["background"]}
            on:click={async (e) => {
              if (!$ServerSettingsChanges) return;
              $ServerSettingsChanges.cancel();
              ServerSettingsChanges.set(null);
            }}
          >
            Cancel
          </div>
        {/if}
      </div>
      {#if modal.page == SettingsServerPage.Overview}
        <ServerSettingsModalOverview server={modal.server} />
      {/if}
    </div>
    <div class="relative flex flex-col items-end">
      <div
        class="rounded-full p-2 cursor-pointer h-fit w-fit"
        style:border="3px solid {$Theme["tertiary-background"]}"
        on:click={() => item.close()}
      >
        <IconX size={20} />
      </div>
    </div>
  </div>
</ModalBase>

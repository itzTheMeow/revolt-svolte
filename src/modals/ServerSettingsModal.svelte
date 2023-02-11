<script lang="ts">
  import { IconX } from "@tabler/icons-svelte";
  import Header from "extra/Header.svelte";
  import { MobileLayout } from "State";
  import { Theme } from "Theme";
  import ModalBase from "./ModalBase.svelte";
  import type { Modal, ModalData } from "./ModalStack";
  import ServerSettingsModalButton from "./ServerSettingsModalButton.svelte";
  import ServerSettingsModalOverview from "./ServerSettingsModalOverview.svelte";
  import { ServerSettingsCategories, ServerSettingsChanges, SettingsServerPage } from "./Settings";

  export let modal: Extract<ModalData, { type: "settings_server" }>;
  let item: Modal;
</script>

<ModalBase {modal} bind:item full>
  <div
    class="flex w-full max-w-5xl mx-auto {$MobileLayout ? 'flex-col-reverse gap-1' : 'my-8 gap-6'}"
  >
    {#if !$MobileLayout}
      <div class="flex flex-col gap-2 items-center">
        <div
          class="flex flex-col gap-1 p-6 rounded-lg w-56 h-fit"
          style:background={$Theme["secondary-background"]}
        >
          <div class="text-lg font-semibold">{modal.server.name}</div>
          {#each ServerSettingsCategories as cat}
            {#if cat.name}
              <Header className="mb-1 mt-0.5">{cat.name}</Header>
            {/if}
            {#each cat.items as i}
              <ServerSettingsModalButton category={i.id} icon={i.icon} {modal} />
            {/each}
          {/each}
        </div>
        <div class="flex gap-1">
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
      </div>
    {/if}
    <div class="flex-1">
      <div class="flex mb-3 gap-1 items-center {$MobileLayout ? 'mt-1' : ''}">
        {#if !$MobileLayout}
          <h1 class="mr-3">{SettingsServerPage[modal.page]}</h1>
        {:else if $ServerSettingsChanges}
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
    <div class="relative flex gap-5 {$MobileLayout ? 'items-center' : ''}">
      {#if $MobileLayout}
        <select
          class="select flex-1"
          style:background-color={$Theme["secondary-background"]}
          bind:value={modal.page}
        >
          {#each ServerSettingsCategories as cat}
            {#if cat.name}
              <optgroup label={cat.name}>
                {#each cat.items as i}
                  <option value={i.id}>{SettingsServerPage[i.id]}</option>
                {/each}
              </optgroup>
            {:else}
              {#each cat.items as i}
                <option value={i.id}>{SettingsServerPage[i.id]}</option>
              {/each}
            {/if}
          {/each}
        </select>
      {/if}
      <div
        class="rounded-full p-2 cursor-pointer h-fit w-fit"
        style:border="{$MobileLayout ? 2 : 3}px solid {$Theme["tertiary-background"]}"
        on:click={() => item.close()}
      >
        <IconX size={20} />
      </div>
    </div>
  </div>
</ModalBase>

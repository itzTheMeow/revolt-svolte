<script lang="ts">
  import { IconUpload, IconX } from "@tabler/icons-svelte";
  import byteSize from "byte-size";
  import { client } from "Client";
  import type { API, Server } from "revolt-toolset";
  import { AutumnService, fetchAutumn } from "State";
  import { Theme } from "Theme";
  import { ServerDetails } from "utils";
  import { ModalStack } from "./ModalStack";
  import { ServerSettingsChanges } from "./Settings";

  export let server: Server;
  fetchAutumn();

  let changes: API.DataEditServer = {
      name: server.name,
      description: server.description,
      icon: server.icon?.id,
    },
    Uploader: HTMLInputElement;
  $: ServerSettingsChanges.set(
    changes.name !== server.name ||
      changes.description !== server.description ||
      changes.icon !== server.icon?.id
  );

  $: iconURL =
    changes.icon == server.icon?.id
      ? server.generateIconURL({ max_side: 128 })
      : Uploader.files?.[0]
      ? URL.createObjectURL(Uploader.files[0])
      : "";
</script>

<h1 class="text-lg mb-3">Overview</h1>

<div class="flex flex-col gap-0.5 items-center w-fit relative">
  <input
    type="file"
    class="hidden"
    bind:this={Uploader}
    on:change={async (e) => {
      const file = Uploader.files?.[0];
      if (file) {
        if (file.size > ($AutumnService?.tags.icons.max_size || 0))
          ModalStack.push({
            type: "markdown",
            title: "File Too Large",
            content: `Your file is too large! Max size is ${byteSize(
              $AutumnService?.tags.icons.max_size || 0
            )}.`,
          });
        else changes.icon = await client.uploadAttachment(file.name, file, "icons");
      }
    }}
  />
  {#if changes.icon && iconURL}
    <img src={iconURL} alt="" class="w-16 h-16 rounded-full" />
  {:else}
    <div
      class="bg-black bg-opacity-30 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
    >
      {ServerDetails(server).acronym}
    </div>
  {/if}
  <div
    class="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer opacity-0 w-16 h-16 rounded-full flex items-center justify-center bg-black bg-opacity-50 hover:opacity-100 transition"
    on:click={async () => {
      if (changes.icon) changes.icon = "";
      else Uploader.click();
    }}
  >
    {#if changes.icon}
      <IconX size={30} />
    {:else}
      <IconUpload size={30} />
    {/if}
  </div>
  <div class="text-xs" style:color={$Theme["tertiary-foreground"]}>
    (MAX {byteSize($AutumnService?.tags.icons.max_size || 0)})
  </div>
</div>

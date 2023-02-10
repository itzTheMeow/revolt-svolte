<script lang="ts">
  import { IconPlus, IconUpload, IconX } from "@tabler/icons-svelte";
  import byteSize from "byte-size";
  import { client } from "Client";
  import Header from "extra/Header.svelte";
  import type { ExportedImageUploader } from "extra/ImageUploader";
  import ImageUploader from "extra/ImageUploader.svelte";
  import type { API, Server } from "revolt-toolset";
  import { AutumnService, fetchAutumn, MobileLayout } from "State";
  import { onMount } from "svelte";
  import { Theme } from "Theme";
  import { ServerDetails } from "utils";
  import Input from "../extra/Input.svelte";
  import { ModalStack } from "./ModalStack";
  import { ServerSettingsChanges } from "./Settings";

  export let server: Server;
  fetchAutumn();

  let changes = {
      name: server.name,
      description: server.description,
      icon: server.icon?.id,
      banner: server.banner?.id,
    },
    iconUploader: ExportedImageUploader,
    bannerUploader: ExportedImageUploader;

  $: ServerSettingsChanges.set(
    changes.name !== server.name ||
      changes.description !== server.description ||
      changes.icon !== server.icon?.id ||
      changes.banner !== server.banner?.id
      ? {
          save: saveChanges,
          cancel: () => {
            changes = {
              name: server.name,
              description: server.description,
              icon: server.icon?.id,
              banner: server.banner?.id,
            };
          },
        }
      : null
  );

  $: iconURL =
    changes.icon == server.icon?.id
      ? server.generateIconURL({ max_side: 128 })
      : iconUploader.file
      ? URL.createObjectURL(iconUploader.file)
      : "";
  $: bannerURL =
    changes.banner == server.banner?.id
      ? server.generateBannerURL({ max_side: 512 })
      : bannerUploader.file
      ? URL.createObjectURL(bannerUploader.file)
      : "";

  async function saveChanges() {
    const o: API.DataEditServer = {};
    if (changes.name !== server.name) o.name = changes.name;
    if (changes.description !== server.description) o.description = changes.description;
    if (!changes.icon) o.remove = [...(o.remove || []), "Icon"];
    else if (changes.icon !== (server.icon?.id || "")) o.icon = changes.icon;
    if (!changes.banner) o.remove = [...(o.remove || []), "Banner"];
    else if (changes.banner !== (server.banner?.id || "")) o.banner = changes.banner;
    await server.edit(o);
  }

  onMount(() => {
    iconUploader.onupload(async (file) => {
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
    });
    bannerUploader.onupload(async (file) => {
      if (file) {
        if (file.size > ($AutumnService?.tags.banners.max_size || 0))
          ModalStack.push({
            type: "markdown",
            title: "File Too Large",
            content: `Your file is too large! Max size is ${byteSize(
              $AutumnService?.tags.banners.max_size || 0
            )}.`,
          });
        else changes.banner = await client.uploadAttachment(file.name, file, "banners");
      }
    });
  });
</script>

<div class="flex items-center gap-3">
  <div class="flex flex-col gap-0.5 items-center w-fit relative shrink-0">
    <ImageUploader bind:uploader={iconUploader} round />
    {#if changes.icon && iconURL}
      <img src={iconURL} alt="" class="w-16 h-16 rounded-full object-cover" />
    {:else}
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
        style:background={$Theme["secondary-background"]}
      >
        {ServerDetails(server).acronym}
      </div>
    {/if}
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer opacity-0 w-16 h-16 rounded-full flex items-center justify-center bg-black bg-opacity-50 hover:opacity-100 transition"
      on:click={async () => {
        if (changes.icon) changes.icon = "";
        else iconUploader.trigger();
      }}
    >
      {#if changes.icon}
        <IconX size={30} />
      {:else}
        <IconUpload size={30} />
      {/if}
    </div>
    <div
      class="text-[10px] absolute top-full w-max mt-0.5"
      style:color={$Theme["tertiary-foreground"]}
    >
      MAX {byteSize($AutumnService?.tags.icons.max_size || 0)}
    </div>
  </div>
  <div class="flex flex-col">
    <Header className="ml-0.5 mb-0.5">Name</Header>
    <Input className=" {$MobileLayout ? '' : 'max-w-xs'}" bind:value={changes.name} />
  </div>
</div>

<Header className="mt-8 ml-0.5 mb-1">Description</Header>
<Input rows={4} bind:value={changes.description} />

<Header className="mt-2 ml-0.5 mb-1">Banner</Header>
<div class="flex flex-col items-start relative">
  <ImageUploader bind:uploader={bannerUploader} aspect={2} />
  {#if changes.banner && bannerURL}
    <img src={bannerURL} alt="" class="h-48 aspect-[2/1] rounded object-cover" />
  {:else}
    <div
      class="h-48 aspect-[2/1] rounded flex items-center justify-center"
      style:background={$Theme["secondary-background"]}
    >
      <IconPlus size={30} />
    </div>
  {/if}
  <div
    class="absolute top-0 left-0 cursor-pointer opacity-0 h-48 aspect-[2/1] rounded flex items-center justify-center bg-black bg-opacity-50 hover:opacity-100 transition"
    on:click={async () => {
      if (changes.banner) changes.banner = "";
      else bannerUploader.trigger();
    }}
  >
    {#if changes.banner}
      <IconX size={30} />
    {/if}
  </div>
  <div class="text-[10px] ml-0.5" style:color={$Theme["tertiary-foreground"]}>
    MAX {byteSize($AutumnService?.tags.banners.max_size || 0)}
  </div>
</div>

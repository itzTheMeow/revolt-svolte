<script lang="ts">
  import { client } from "Client";
  import { CMState } from "contextmenu/ContextMenuState";
  import { parseAutocomplete, uploadAttachment, type AutocompleteTabResult } from "revolt-toolset";
  import {
    autocomplete,
    MessageInputSelected,
    MobileLayout,
    pushFile,
    replyingTo,
    selectBottom,
    SelectedChannel,
    SelectedServer,
    selectInput,
    uploadedFiles,
  } from "State";
  import { afterUpdate, beforeUpdate } from "svelte";
  import {
    ArrowBigRightLine,
    Clipboard,
    FileUpload,
    Hash,
    Paperclip,
    Volume,
  } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { handleUpdates, proxyURL } from "utils";
  import AutocompleteItem from "./AutocompleteItem.svelte";
  import TextboxReply from "./TextboxReply.svelte";
  import TextboxUploaded from "./TextboxUploaded.svelte";

  let inputtedMessage = "",
    MessageInput: HTMLTextAreaElement,
    FileInput: HTMLInputElement,
    SendButton: HTMLDivElement,
    hasBottom = false,
    UploaderButton: HTMLDivElement;
  function recalculateAutocomplete() {
    if (!$MessageInputSelected) return autocomplete.set(null);
    autocomplete.set(
      parseAutocomplete($SelectedServer!, inputtedMessage, MessageInput.selectionStart || 0)
    );
  }
  function handleAutocomplete(e: KeyboardEvent) {
    if ($autocomplete?.size && (e.key == "Enter" || e.key == "Tab")) {
      e.preventDefault();
      handleAutocompleteTab(
        $autocomplete.tab(
          [...$autocomplete.channels, ...$autocomplete.emojis, ...$autocomplete.users][0]
        )
      );
      recalculateAutocomplete();
      return true;
    }
    return false;
  }
  function handleAutocompleteTab(res: AutocompleteTabResult | undefined) {
    if (!res) return;
    inputtedMessage = res.text;
    MessageInput.focus();
    MessageInput.setSelectionRange(res.newCursor, res.newCursor);
    recalculateAutocomplete();
  }

  async function sendMessage() {
    if (!$SelectedChannel || (!inputtedMessage.trim() && !$uploadedFiles.length)) return;

    const content = inputtedMessage ? inputtedMessage : null,
      channel = $SelectedChannel;
    const fc = SendButton.firstElementChild as HTMLDivElement;
    SendButton.classList.add("loading");
    fc.style.display = "none";
    inputtedMessage = "";
    recalculateAutocomplete();
    const toUpload = [...$uploadedFiles];
    $uploadedFiles.splice(0);
    $uploadedFiles = $uploadedFiles;
    const replies = $replyingTo.map((r) => ({ id: r._id, mention: false }));
    replyingTo.set([]);
    const attachments: string[] = [];
    for (const attachment of toUpload) {
      try {
        const id = await uploadAttachment(attachment.name, attachment.data);
        if (id) attachments.push(id);
      } catch (err) {
        console.error("no attachment", err);
      }
    }
    const message = await channel.sendMessage({
      content,
      attachments: attachments.length ? attachments : null,
      replies,
    });
    SendButton.classList.remove("loading");
    fc.style.display = "";
    recalculateAutocomplete();
  }

  function handleUpload(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!$MobileLayout || !navigator.clipboard.read) return FileInput.click();
    if ($CMState) {
      if (!$CMState.time || Date.now() - $CMState.time < 600) FileInput.click();
      return CMState.set(null);
    }

    CMState.set({
      type: "options",
      pos: {
        left: UploaderButton.getBoundingClientRect().left + 4,
        bottom: UploaderButton.getBoundingClientRect().height + 6,
      },
      time: Date.now(),
      options: [
        {
          name: "From Clipboard",
          async clicked() {
            const files = await navigator.clipboard.read?.();
            files?.forEach(async (file) => {
              const mime = file.types[0];
              if (!mime) return;
              const blob = await file.getType(mime);
              if (blob) {
                pushFile(
                  new File([blob], `${mime.split("/")[0]}.${mime.split("/").pop()}`, { type: mime })
                );
                selectBottom();
              }
            });
          },
          icon: Clipboard,
        },
        {
          name: "Choose File",
          clicked() {
            FileInput.click();
          },
          icon: FileUpload,
        },
      ],
    });
    return false;
  }

  handleUpdates(beforeUpdate, afterUpdate);
</script>

<TextboxUploaded />

<!-- Autocomplete -->

{#if $autocomplete?.size}
  <div
    class="overflow-y-auto py-2 w-full"
    style="max-height:35%;background-color:{$Theme['primary-header']};"
  >
    {#each $autocomplete.channels.slice(0, 15) as c}
      <AutocompleteItem
        icon={c.icon
          ? proxyURL(c.generateIconURL({ max_side: 64 }), "image")
          : c.channel_type == "VoiceChannel"
          ? Volume
          : Hash}
        name={c.name || ""}
        onclick={() => handleAutocompleteTab($autocomplete?.tab(c))}
      />
    {/each}
    {#each $autocomplete.emojis.slice(0, 15) as e}
      <AutocompleteItem
        icon={proxyURL(e.imageURL, "image")}
        name={e.name || ""}
        detail={e.parent.type == "Server" ? client.servers.get(e.parent.id)?.name || "" : ""}
        onclick={() => handleAutocompleteTab($autocomplete?.tab(e))}
      />
    {/each}
    {#each $autocomplete.users.slice(0, 15) as u}
      <AutocompleteItem
        icon={proxyURL(
          u.generateAvatarURL({ max_side: 64 }) || u.user?.generateAvatarURL({ max_side: 64 }),
          "image"
        )}
        name={u.nickname || u.user?.username || ""}
        detail={u.user?.username || ""}
        rounded
        onclick={() => handleAutocompleteTab($autocomplete?.tab(u))}
      />
    {/each}
  </div>
{/if}

<!-- Replies -->

{#if $replyingTo.length}
  <div class="w-full flex flex-col gap-1 mt-1 pb-1 px-1">
    {#each $replyingTo as reply}
      <TextboxReply message={reply} />
    {/each}
  </div>
{/if}

<!-- Textbox / Buttons -->

<div class="flex w-full min-h-12">
  <input
    type="file"
    class="hidden"
    bind:this={FileInput}
    multiple
    on:change={() => {
      const takeBottom = !$MobileLayout || !!$selectInput;
      const files = [...(FileInput.files || [])];
      files.forEach(pushFile);
      if (takeBottom) selectBottom();
    }}
  />
  <!-- svelte-ignore missing-declaration -->
  <div
    class="btn btn-square btn-secondary rounded-none border-none h-12 mt-auto"
    style="background-color:{$Theme['primary-header']};"
    id="UploaderButton"
    bind:this={UploaderButton}
    on:click={handleUpload}
    on:touchend={handleUpload}
  >
    <Paperclip />
  </div>
  <div class="flex-1 flex items-center" style:background-color={$Theme["message-box"]}>
    <textarea
      id="Textbox"
      class="w-full resize-none bg-inherit px-1 py-3 box-content"
      style:outline="none"
      style:height="{Math.max(1, inputtedMessage.split("\n").length) * 1.5}rem"
      autocomplete="on"
      bind:this={MessageInput}
      bind:value={inputtedMessage}
      on:keydown={(e) => {
        recalculateAutocomplete();
        if (handleAutocomplete(e)) return;
        if (e.key == "Enter" && !e.shiftKey) {
          sendMessage();
          e.preventDefault();
        }
      }}
      on:keyup={() => {
        recalculateAutocomplete();
      }}
      on:touchmove={() => recalculateAutocomplete()}
      on:touchend={() => recalculateAutocomplete()}
      on:mouseup={() => recalculateAutocomplete()}
      on:click={() => {
        MessageInputSelected.set(true);
        recalculateAutocomplete();
      }}
      on:focus={() => {
        MessageInputSelected.set(true);
        recalculateAutocomplete();
      }}
      on:blur={() => {
        MessageInputSelected.set(false);
        recalculateAutocomplete();
      }}
    />
  </div>
  <div
    class="btn btn-square btn-primary rounded-none border-none h-12 mt-auto"
    style="background-color:{$Theme['accent']};"
    bind:this={SendButton}
    on:touchend={(e) => {
      e.preventDefault();
      sendMessage();
      return false;
    }}
    on:click={() => sendMessage()}
  >
    <ArrowBigRightLine />
  </div>
</div>

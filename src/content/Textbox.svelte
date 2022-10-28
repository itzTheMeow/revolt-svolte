<script lang="ts">
  import { client } from "Client";
  import { uploadAttachment } from "revolt-toolset";
  import { parseAutocomplete, type AutocompleteTabResult } from "revolt-toolset/dist/autocomplete";
  import {
    autocomplete,
    MessageInputSelected,
    pendBottom,
    pushFile,
    replyingTo,
    SelectedChannel,
    SelectedServer,
    selectInput,
    uploadedFiles,
  } from "State";
  import { ArrowBigRightLine, Hash, Paperclip, Volume } from "tabler-icons-svelte";
  import { Theme } from "Theme";
  import { proxyURL } from "utils";
  import AutocompleteItem from "./AutocompleteItem.svelte";
  import TextboxReply from "./TextboxReply.svelte";
  import TextboxUploaded from "./TextboxUploaded.svelte";

  let inputtedMessage = "",
    MessageInput: HTMLInputElement,
    FileInput: HTMLInputElement,
    SendButton: HTMLDivElement;
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
    if (!$SelectedChannel || (!inputtedMessage && !$uploadedFiles.length)) {
      if ($selectInput) {
        $selectInput.focus();
        selectInput.set(null);
      }
      return;
    }
    selectInput.set(MessageInput);
    const content = inputtedMessage ? inputtedMessage : null;
    const fc = SendButton.firstElementChild as HTMLDivElement;
    SendButton.classList.add("loading");
    fc.style.display = "none";
    pendBottom.set(true);
    inputtedMessage = "";
    const toUpload = [...$uploadedFiles];
    $uploadedFiles.splice(0);
    $uploadedFiles = $uploadedFiles;
    const attachments: string[] = [];
    for (const attachment of toUpload) {
      try {
        const id = await uploadAttachment(attachment.name, attachment.data);
        if (id) attachments.push(id);
      } catch (err) {
        console.error("no attachment", err);
      }
    }
    const message = await $SelectedChannel.sendMessage({
      content,
      attachments: attachments.length ? attachments : null,
      replies: $replyingTo.map((r) => ({ id: r._id, mention: false })),
    });
    SendButton.classList.remove("loading");
    fc.style.display = "";
    pendBottom.set(true);
    replyingTo.set([]);
    recalculateAutocomplete();
  }
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

<div class="h-12 flex w-full" style="background-color:{$Theme['message-box']};">
  <input
    type="file"
    class="hidden"
    bind:this={FileInput}
    multiple
    on:change={() => {
      const files = [...(FileInput.files || [])];
      files.forEach(pushFile);
    }}
  />
  <div
    class="btn btn-square btn-secondary rounded-none border-none"
    style="background-color:{$Theme['primary-header']};"
    on:click={() => FileInput.click()}
  >
    <Paperclip />
  </div>
  <input
    id="Textbox"
    class="flex-1 bg-inherit p-1"
    style="outline:none;"
    type="text"
    autocomplete="on"
    bind:this={MessageInput}
    bind:value={inputtedMessage}
    on:keydown={recalculateAutocomplete}
    on:keyup={(e) => {
      if (handleAutocomplete(e)) return;
      if (e.key == "Enter") sendMessage();
      recalculateAutocomplete();
    }}
    on:touchmove={() => recalculateAutocomplete()}
    on:touchend={() => recalculateAutocomplete()}
    on:mouseup={() => recalculateAutocomplete()}
    on:click={() => MessageInputSelected.set(true)}
    on:focus={() => MessageInputSelected.set(true)}
    on:focusin={() => MessageInputSelected.set(true)}
    on:blur={() => MessageInputSelected.set(false)}
  />
  <div
    class="btn btn-square btn-primary rounded-none border-none"
    style="background-color:{$Theme['accent']};"
    bind:this={SendButton}
    on:touchstart={() => {
      MessageInput.focus();
    }}
    on:touchend={() => {
      MessageInput.focus();
    }}
    on:click={() => sendMessage()}
  >
    <ArrowBigRightLine />
  </div>
</div>

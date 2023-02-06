<script lang="ts">
  import {
    IconArrowBigRightLine,
    IconClipboard,
    IconFileUpload,
    IconHash,
    IconPaperclip,
    IconVolume,
  } from "@tabler/icons-svelte";
  import { client } from "Client";
  import { CMState } from "contextmenu/ContextMenuState";
  import { Emoji, parseAutocomplete, type AutocompleteResult } from "revolt-toolset";
  import {
    autocomplete,
    MessageInputSelected,
    MobileLayout,
    pushFile,
    replyingTo,
    selectBottom,
    selectedAutocomplete,
    SelectedChannel,
    SelectedServer,
    selectInput,
    uploadedFiles,
  } from "State";
  import { onMount, tick } from "svelte";
  import { Theme } from "Theme";
  import { MemberOrUserDetails } from "utils";
  import AutocompleteItem from "./AutocompleteItem.svelte";
  import TextboxReply from "./TextboxReply.svelte";
  import TextboxTyping from "./TextboxTyping.svelte";
  import TextboxUploaded from "./TextboxUploaded.svelte";

  const MAX_AUTOCOMPLETE = 8;

  let inputtedMessage = "",
    MessageInput: HTMLTextAreaElement,
    FileInput: HTMLInputElement,
    SendButton: HTMLDivElement,
    UploaderButton: HTMLDivElement;
  function recalculateAutocomplete() {
    if (!$MessageInputSelected) return autocomplete.set(null);
    const ac = parseAutocomplete(
      $SelectedChannel!,
      inputtedMessage,
      MessageInput.selectionStart || 0,
      {
        emojis: true,
        users: true,
      }
    );
    const str = (a: AutocompleteResult) => a.all.map((a) => a.id).join("/");
    if ($autocomplete && ac && str(ac) == str($autocomplete)) return;
    autocomplete.set(ac);
  }
  function handleAutocomplete(e: KeyboardEvent) {
    if ($autocomplete?.size) {
      if (e.key == "Enter" || e.key == "Tab") {
        e.preventDefault();
        handleAutocompleteTab($selectedAutocomplete);
        recalculateAutocomplete();
        return true;
      } else if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        e.preventDefault();
        let i = $autocomplete.all.findIndex((t) => t.id == $selectedAutocomplete);
        i += e.key == "ArrowUp" ? -1 : 1;
        if (i < 0) i = Math.min($autocomplete.all.length, MAX_AUTOCOMPLETE) - 1;
        if (i > Math.min($autocomplete.all.length, MAX_AUTOCOMPLETE) - 1) i = 0;
        $selectedAutocomplete = $autocomplete.all[i]?.id || $autocomplete.all[0]?.id || "";
        return true;
      }
    }
    return false;
  }
  async function handleAutocompleteTab(id: string) {
    if (!$autocomplete?.all.length) return;
    const res = $autocomplete.tab(
      $autocomplete.all.find((a) => a.id == id) || $autocomplete.all[0]
    );
    if (!res) return;
    inputtedMessage = res.text;
    await tick();
    MessageInput.focus();
    MessageInput.setSelectionRange(res.newCursor, res.newCursor);
    selectedAutocomplete.set("");
    autocomplete.set(null);
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
    const replies = $replyingTo.map((r) => ({ id: r.id, mention: false }));
    replyingTo.set([]);
    const attachments: string[] = [];
    for (const attachment of toUpload) {
      try {
        const id = await client.uploadAttachment(attachment.name, attachment.data);
        if (id) attachments.push(id);
      } catch (err) {
        console.error("no attachment", err);
      }
    }
    const message = await channel.send({
      content,
      attachments: attachments.length ? attachments : null,
      replies,
      expandEmojis: true,
      expandMentions: true,
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
          icon: IconClipboard,
        },
        {
          name: "Choose File",
          clicked() {
            FileInput.click();
          },
          icon: IconFileUpload,
        },
      ],
      target: UploaderButton,
    });
    return false;
  }

  onMount(() => {
    if (!$MobileLayout) MessageInput.focus();
  });
</script>

<TextboxTyping />
<TextboxUploaded />

<!-- Autocomplete -->

{#if $autocomplete?.size}
  <div
    class="overflow-y-auto p-2 w-full flex flex-col gap-1"
    style="max-height:{MAX_AUTOCOMPLETE * 2 +
      (MAX_AUTOCOMPLETE + 1) * 0.25}rem;background-color:{$Theme['primary-header']};"
  >
    {#each $autocomplete.channels.slice(0, MAX_AUTOCOMPLETE) as c (c.id)}
      <AutocompleteItem
        id={c.id}
        icon={c.icon ? c.generateIconURL({ max_side: 64 }) : c.isVoice() ? IconVolume : IconHash}
        name={c.name || ""}
        onclick={() => handleAutocompleteTab(c.id)}
      />
    {/each}
    {#each $autocomplete.emojis.slice(0, MAX_AUTOCOMPLETE) as e (e.id)}
      <AutocompleteItem
        id={e.id}
        icon={(e instanceof Emoji ? e : e.setPack("twemoji")).imageURL}
        name={e.uniqueName || ""}
        detail={e.parent?.name || ""}
        onclick={() => handleAutocompleteTab(e.id)}
      />
    {/each}
    {#each $autocomplete.users.slice(0, MAX_AUTOCOMPLETE) as u (u.id)}
      <AutocompleteItem
        id={u.id}
        icon={MemberOrUserDetails(u, $SelectedServer?.members.get(u.id)).avatar || ""}
        name={MemberOrUserDetails(u, $SelectedServer?.members.get(u.id)).name}
        detail={$SelectedServer?.members.get(u.id)?.nickname ? u.username : ""}
        rounded
        onclick={() => handleAutocompleteTab(u.id)}
      />
    {/each}
  </div>
{/if}

<!-- Replies -->

{#if $replyingTo.length}
  <div class="w-full flex flex-col gap-1 mt-1 pb-1 px-1">
    {#each $replyingTo as reply (reply.id)}
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
  <div
    class="btn btn-square btn-secondary rounded-none border-none h-12 mt-auto"
    style="background-color:{$Theme['primary-header']};"
    bind:this={UploaderButton}
    on:click={handleUpload}
    on:touchend={handleUpload}
  >
    <IconPaperclip />
  </div>
  <div class="flex-1 flex items-center" style:background-color={$Theme["message-box"]}>
    <textarea
      id="Textbox"
      class="w-full resize-none bg-inherit pl-1.5 pr-2.5 py-3 box-content"
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
    <IconArrowBigRightLine />
  </div>
</div>

<script lang="ts">
	import { client } from "$lib/Client";
	import {
		AppWidth,
		MessageInputSelected,
		MessageOffset,
		MobileLayout,
		SelectedChannel,
		SelectedServer,
		autocomplete,
		isEditing,
		pushFile,
		replyingTo,
		selectBottom,
		selectInput,
		selectedAutocomplete,
		uploadedFiles,
	} from "$lib/State";
	import { Theme } from "$lib/Theme";
	import { MemberOrUserDetails, ZIndexes, scrollTo } from "$lib/utils";
	import {
		IconArrowBigRightLine,
		IconCheck,
		IconClipboard,
		IconFileUpload,
		IconHash,
		IconMoodHappy,
		IconPaperclip,
		IconVolume,
		IconX,
	} from "@tabler/icons-svelte";
	import { Emoji, Message, parseAutocomplete, type AutocompleteResult } from "revkit";
	import { onMount, tick } from "svelte";
	import { CMState } from "../contextmenu/ContextMenuState";
	import { floatingMenu } from "../contextmenu/FloatingMenu";
	import { ModalStack } from "../modals/ModalStack";
	import AutocompleteItem from "./AutocompleteItem.svelte";
	import TextboxButton from "./TextboxButton.svelte";
	import TextboxReply from "./TextboxReply.svelte";
	import TextboxTyping from "./TextboxTyping.svelte";
	import TextboxUploaded from "./TextboxUploaded.svelte";

	export let standalone: Message | null = null,
		className = "";

	const MAX_AUTOCOMPLETE = 8;

	let inputtedMessage = standalone?.content || "",
		cursorPos = 0;

	let MessageInput: HTMLTextAreaElement,
		FileInput: HTMLInputElement,
		SendButton: HTMLDivElement,
		UploaderButton: HTMLDivElement,
		EmojiPickerButton: HTMLDivElement,
		barHeight = 0,
		BoxSizer: HTMLDivElement;
	function recalculateAutocomplete() {
		if (!$MessageInputSelected) return autocomplete.set(null);
		const ac = parseAutocomplete(
			$SelectedChannel!,
			inputtedMessage,
			MessageInput.selectionStart || 0,
			{
				emojis: true,
				users: true,
			},
		);
		const str = (a: AutocompleteResult) => a.all.map((a) => a.id).join("/");
		if ($autocomplete && ac && str(ac) == str($autocomplete)) return;
		autocomplete.set(ac ? { ...ac, standalone: !!standalone } : null);
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
			$autocomplete.all.find((a) => a.id == id) || $autocomplete.all[0],
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
		if (!$SelectedChannel) return;
		if (!inputtedMessage.trim()) {
			if (standalone) return ModalStack.showDeleteModal(standalone);
			if (!$uploadedFiles.length) return;
		}

		const content = inputtedMessage ? inputtedMessage : null,
			channel = $SelectedChannel;
		const fc = SendButton.firstElementChild as HTMLDivElement;
		SendButton.classList.add("loading");
		fc.style.display = "none";
		if (!standalone) inputtedMessage = "";
		recalculateAutocomplete();
		tick().then(() => {
			barHeight = BoxSizer.clientHeight;
		});

		const toUpload = standalone ? [] : [...$uploadedFiles];
		$uploadedFiles.splice(0);
		$uploadedFiles = $uploadedFiles;
		const replies = standalone ? [] : $replyingTo.map((r) => ({ id: r[0].id, mention: r[1] }));
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

		if (!standalone) {
			MessageOffset.set(channel.lastMessageID);
			tick().then(() => scrollTo("bottom", true));
		}

		const message = standalone
			? await standalone.edit({ content, expandEmojis: true, expandMentions: true })
			: await channel.send({
					content,
					attachments: attachments.length ? attachments : null,
					replies,
					expandEmojis: true,
					expandMentions: true,
			  });

		if (!standalone) {
			MessageOffset.set(message.id);
			tick().then(() => scrollTo("bottom", true));
		}
		SendButton.classList.remove("loading");
		fc.style.display = "";
		recalculateAutocomplete();
		if (standalone) {
			inputtedMessage = "";
			isEditing.set(null);
		}
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
									new File([blob], `${mime.split("/")[0]}.${mime.split("/").pop()}`, {
										type: mime,
									}),
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

	function handleEmojiPicker(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		if ($floatingMenu?.type == "emoji_picker") return floatingMenu.set(null);
		MessageInput?.blur();
		floatingMenu.set({
			type: "emoji_picker",
			target: EmojiPickerButton,
			pos: {
				right:
					$AppWidth -
					EmojiPickerButton.getBoundingClientRect().left -
					EmojiPickerButton.getBoundingClientRect().width +
					4,
				bottom: EmojiPickerButton.getBoundingClientRect().height + 6,
			},
			input: MessageInput,
			cursor: cursorPos,
		});
	}

	onMount(() => {
		barHeight = BoxSizer.clientHeight;
		if (!$MobileLayout || standalone) MessageInput.focus();
	});
</script>

<div class="flex flex-col relative {className}">
	{#if !standalone}
		<TextboxTyping />
		<TextboxUploaded />
	{/if}

	<!-- Autocomplete -->
	{#if $autocomplete?.size && $autocomplete.standalone == !!standalone}
		<div
			class="overflow-y-auto px-2 py-2.5 w-[calc(100%-2rem)] flex flex-col gap-1 absolute bottom-full left-4 rounded-t-md"
			style="max-height:{MAX_AUTOCOMPLETE * 2 +
				(MAX_AUTOCOMPLETE + 1) * 0.25}rem;background-color:{$Theme['primary-header']};"
			style:z-index={ZIndexes.Autocomplete}
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
					detail={u.tag}
					rounded
					onclick={() => handleAutocompleteTab(u.id)}
				/>
			{/each}
		</div>
	{/if}

	<!-- Replies -->

	{#if $replyingTo.length && !standalone}
		<div class="w-full flex flex-col gap-1 mt-1 pb-1 px-1">
			{#each $replyingTo as reply (reply[0].id)}
				<TextboxReply {reply} />
			{/each}
		</div>
	{/if}

	<!-- Textbox / Buttons -->

	<div class="flex w-full min-h-12">
		{#if !standalone}
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
			<TextboxButton
				color={$Theme["primary-header"]}
				onclick={handleUpload}
				icon={IconPaperclip}
				bind:button={UploaderButton}
				{standalone}
			/>
		{:else}
			<TextboxButton
				color={$Theme["error"]}
				onclick={() => isEditing.set(null)}
				icon={IconX}
				{standalone}
			/>
		{/if}
		<div class="flex-1 flex items-center relative" style:background-color={$Theme["message-box"]}>
			<textarea
				id="Textbox"
				class="w-full resize-none bg-inherit pl-1.5 pr-2.5 py-3 max-h-[30vh]"
				style:outline="none"
				style:height="{barHeight}px"
				autocomplete="on"
				bind:this={MessageInput}
				bind:value={inputtedMessage}
				on:keydown={(e) => {
					recalculateAutocomplete();
					barHeight = BoxSizer.clientHeight;
					if (handleAutocomplete(e)) return;
					if (e.key == "Enter" && !e.shiftKey) {
						sendMessage();
						e.preventDefault();
					}
					barHeight = BoxSizer.clientHeight;
					cursorPos = MessageInput.selectionStart;
				}}
				on:keyup={() => {
					barHeight = BoxSizer.clientHeight;
					recalculateAutocomplete();
					cursorPos = MessageInput.selectionStart;
				}}
				on:input={async () => {
					await tick();
					barHeight = BoxSizer.clientHeight;
					cursorPos = MessageInput.selectionStart;
				}}
				on:touchmove={() => recalculateAutocomplete()}
				on:touchend={() => {
					recalculateAutocomplete();
					cursorPos = MessageInput.selectionStart;
				}}
				on:mouseup={() => recalculateAutocomplete()}
				on:click={() => {
					MessageInputSelected.set(true);
					recalculateAutocomplete();
					cursorPos = MessageInput.selectionStart;
				}}
				on:focus={() => {
					MessageInputSelected.set(true);
					recalculateAutocomplete();
					cursorPos = MessageInput.selectionStart;
				}}
				on:blur={() => {
					MessageInputSelected.set(false);
					recalculateAutocomplete();
				}}
			/>
			<div
				class="invisible absolute pointer-events-none w-full whitespace-pre-wrap break-all pl-1.5 pr-2.5 py-3"
				bind:this={BoxSizer}
			>
				{inputtedMessage
					.split("\n")
					.map((d) => `\u200b${d}`)
					.join("\n") || "\u200b"}
			</div>
		</div>
		{#if !standalone}
			<TextboxButton
				color={$Theme["primary-header"]}
				onclick={handleEmojiPicker}
				icon={IconMoodHappy}
				bind:button={EmojiPickerButton}
				{standalone}
			/>
			<TextboxButton
				color={$Theme["accent"]}
				onclick={sendMessage}
				icon={IconArrowBigRightLine}
				bind:button={SendButton}
				{standalone}
			/>
		{:else}
			<TextboxButton
				color={$Theme["success"]}
				onclick={sendMessage}
				icon={IconCheck}
				bind:button={SendButton}
				{standalone}
			/>
		{/if}
	</div>
</div>

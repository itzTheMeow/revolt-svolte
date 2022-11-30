<script lang="ts">
  import { client } from "Client";
  import type { Message } from "revolt.js";
  import { SelectedServer } from "State";
  import { Theme } from "Theme";
  import { escapeHTML, escapeRegex, Matches, proxyURL } from "utils";

  export let message: Message;
</script>

<div class="whitespace-pre-wrap">
  {@html escapeHTML(message.content || "")
    .replace(escapeRegex(Matches.user), (_, id) => {
      const u = client.users.get(id);
      return `<span style="color:${$Theme["accent"]};">@${escapeHTML(
        u?.username || "Unknown User"
      )}</span>`;
    })
    .replace(escapeRegex(Matches.channel), (_, id) => {
      const c = $SelectedServer?.channels.find((c) => c?._id == id);
      return `<span style="color:${$Theme["accent"]};">#${escapeHTML(
        c?.name || "unknown-channel"
      )}</span>`;
    })
    .replace(escapeRegex(Matches.emojiCustom), (_, id) => {
      const e = client.emojis.get(id);
      return `<img src="${proxyURL(
        `https://autumn.revolt.chat/emojis/${id}`,
        "image"
      )}" class="inline object-contain ${
        message.content?.trim() == _ ? "h-12 w-12" : "h-5 w-5"
      } -mx-0.5 align-middle" />`;
    })}
</div>

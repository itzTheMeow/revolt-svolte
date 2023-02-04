<script lang="ts">
  import { client } from "Client";
  import { showEmojiContext } from "contextmenu/FloatingMenu";
  import type { Processor } from "remark-rehype";
  import { RevoltEmojiDictionary, RevoltEmojiLib, unicodeEmojiURL } from "revolt-toolset";
  import { MobileLayout, SelectedServer } from "State";
  import { afterUpdate } from "svelte";
  import { tippy } from "svelte-tippy";
  import { Theme } from "Theme";
  import { visit } from "unist-util-visit";
  import { MemberDetails, MemberOrUserDetails, UserColor } from "utils";
  import { CUSTOM_EMOJI_REGEX, DENY_TAGS, MarkdownRenderer } from "./renderer";

  type Child =
    | {
        type: "text";
        value: string;
      }
    | {
        type: "element";
        tagName: string;
        properties?: Record<string, string>;
        children?: Child[];
      };

  export let text: string;
  export let keepSpace = false;
  export let line = false;
  export let noPointer = false;

  // shamelessly 'inspired' from revite's renderer
  function sanitize(content: string) {
    return content
      .replace(/(^(?:[>*+-][^\S\r\n]*){5})(?:[>*+-][^\S\r\n]*)+(.*$)/gm, (_, m0, m1) => m0 + m1)
      .replace(/^(<\/?[a-zA-Z0-9]+>)(.*$)/gm, (match) => `\u200E${match}`)
      .replace(/^\s*\+(?:$|[^+])/gm, (match) => `\u200E${match}`)
      .replace(/^\s*?$/gm, "‎")
      .replace(/^([^\S\r\n]*>[^\n]+\n?)+/gm, (match) => `${match}\n`);
  }

  let container: HTMLDivElement, renderer: Processor;
  $: {
    renderer = MarkdownRenderer(() => (tree) => {
      visit(
        tree,
        "element",
        (
          node: {
            type: "element";
            tagName: string;
            properties: {
              type?: "spoiler" | "channel" | "timestamp" | "emoji" | "mention" | "link";
              match?: string;
              arg1?: string;

              href?: string;
              style?: string;
              class?: string;
              target?: "_blank";
              rel?: "noreferrer";
              "data-clickable"?: "";
            };
            children: Child[];
          },
          _: any,
          parent: { children: Child[]; properties: Record<string, string> }
        ) => {
          if (
            parent &&
            ((DENY_TAGS.includes(node.tagName.toLowerCase()) &&
              (node.tagName !== "img" || parent.properties?.type !== "emoji")) ||
              (line && (node.tagName == "table" || node.tagName == "pre")) ||
              (line && node.tagName == "br"))
          ) {
            const i = parent.children.indexOf(node);
            if (i >= 0) parent.children.splice(i, 1);
            return void 0;
          }
          if (node.tagName == "a") {
            if (!node.properties.href?.match(/^https?/gi)) delete node.properties.href;
            else {
              node.properties.style = `color:${$Theme["accent"]};`;
              node.properties.class = "hover:brightness-75";
              node.properties.type = "link";
              node.properties.target = "_blank";
              node.properties.rel = "noreferrer";
            }
            return void 0;
          } else if (node.tagName == "blockquote") {
            node.properties.class = "rounded-lg my-1 px-2 py-0.5";
            node.properties.style = `border-inline-start: 4px solid ${$Theme["tertiary-background"]};background:${$Theme["hover"]};`;
          } else if (node.tagName == "table") {
            node.properties.style = `--bdr:${$Theme["tertiary-foreground"]}`;
          } else if (node.tagName == "code") {
            node.properties.style = `--bg:${$Theme["block"]}`;
          } else if (node.tagName == "p" || node.tagName == "li") {
            node.properties.style = "overflow:hidden;text-overflow:ellipsis;";
          } else if (node.tagName == "ul" && line) {
            node.properties.style =
              "display:inline-flex;gap:0.5rem;overflow:hidden;text-overflow:ellipsis;";
          }
          if (!node.properties.type || !node.properties.match) return void 0;
          switch (node.properties.type) {
            case "channel":
              node.children.push({
                type: "element",
                tagName: "span",
                properties: {
                  style: `color:${$Theme["accent"]};`,
                },
                children: [
                  {
                    type: "text",
                    value: `#${
                      $SelectedServer?.channels.find((c) => c?.id == node.properties.match)?.name ||
                      "unknown-channel"
                    }`,
                  },
                ],
              });
              break;
            case "emoji": {
              const { match } = node.properties,
                emojiURL = CUSTOM_EMOJI_REGEX.test(match)
                  ? `https://autumn.revolt.chat/emojis/${node.properties.match}`
                  : unicodeEmojiURL(
                      match in RevoltEmojiDictionary ? RevoltEmojiDictionary[match] : match,
                      "twemoji"
                    );
              node.properties.class = "inline-block cursor-pointer";
              node.children.push({
                type: "element",
                tagName: "img",
                properties: {
                  src: emojiURL,
                  class: `inline object-contain ${
                    text?.trim() == `:${match}:` && !line
                      ? "h-[3em] w-[3em] elg"
                      : "h-[1.25em] w-[1.25em]"
                  }`,
                  style: "margin: 0px 0.05em 0px 0.1em;vertical-align:-0.2em;",
                },
              });
              break;
            }
            case "mention":
              const member = $SelectedServer?.members.get(node.properties.match),
                details = MemberDetails(member);
              node.children.push({
                type: "element",
                tagName: "span",
                properties: {
                  class:
                    "inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm relative",
                  style: `color:${$Theme["accent"]};`,
                  "data-clickable": "",
                },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class:
                        "absolute top-0 left-0 w-full h-full rounded-[inherit] opacity-10 hover:opacity-25 cursor-pointer",
                      style: `background:${details.color || $Theme["accent"]};`,
                      "data-userpopup": node.properties.match,
                    },
                  },
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: "relative pointer-events-none",
                      style: UserColor(details?.color || $Theme["accent"] || ""),
                    },
                    children: [
                      {
                        type: "text",
                        value:
                          "@" +
                          MemberOrUserDetails(client.users.get(node.properties.match), member)
                            ?.name,
                      },
                    ],
                  },
                ],
              });
              break;
          }
        }
      );
    });
  }
  afterUpdate(() => {
    if (!container) return;
    const emojis = [...container.querySelectorAll<HTMLElement>("emoji")];
    emojis
      .filter((e) => !e.hasAttribute("data-clickable"))
      .forEach(async (e) => {
        e.setAttribute("data-clickable", "");
        const match = e.getAttribute("match") || "",
          emoji = RevoltEmojiLib.find((e) => e.name == match) || (await client.emojis.fetch(match));
        tippy(e, {
          content: `:${emoji?.name || match}:`,
          delay: 80,
          onShow() {
            if ($MobileLayout) return false;
          },
        });
        if (emoji)
          e.addEventListener("click", (ev) => {
            const rect = e.getBoundingClientRect();
            showEmojiContext(emoji, rect.x + rect.width + 4, rect.y + 2, ev.target);
          });
      });
  });
</script>

<div
  class="[line-height:normal] text-[14px] {line
    ? 'whitespace-nowrap flex gap-2'
    : '[word-wrap:break-word]'} {noPointer ? 'pointer-events-none' : ''} {keepSpace
    ? 'min-h-[1rem]'
    : ''}"
  bind:this={container}
>
  {@html String(renderer.processSync(sanitize(text)).value)}
</div>

<!-- just to make sure it 100% includes the classes for emojis/others in the bundle -->
{#if false}
  <alink class="hover:brightness-75" />
  <blockquote class="rounded-lg my-1 px-2 py-0.5" />
  <emoji class="inline object-contain {false ? 'h-[3em] w-[3em]' : 'h-[1.25em] w-[1.25em]'}" />
  <mention
    class="inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm relative pointer-events-none"
  />
  <mention
    class="absolute top-0 left-0 w-full h-full rounded-[inherit] opacity-10 hover:opacity-25 cursor-pointer"
  />
{/if}

<style lang="scss">
  // Tailwind removes "default" browser styles.
  // So they have to be added back since Revite uses them.

  :global(h1, h2, h3, h4, h5, h6) {
    font-size: revert !important;
    font-weight: revert !important;
  }
  :global(ul, ol) {
    list-style: inside !important;
    padding-left: 10px !important;
  }
  :global(table) {
    border-collapse: collapse;
    margin: 4px 0px;
  }
  :global(th, td) {
    padding: 6px;
    border: 1px solid var(--bdr);
  }
  :global(code) {
    font-size: 0.9em;
    background: var(--bg);
    border-radius: 4px;
    box-decoration-break: clone;
    padding: 1px 4px;
  }
  :global(pre) {
    white-space: pre-wrap;
  }
</style>

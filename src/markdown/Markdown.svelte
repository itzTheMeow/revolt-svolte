<script lang="ts">
  import { DENY_TAGS, MarkdownRenderer } from "./renderer";

  import { client } from "Client";
  import { Theme } from "Theme";
  import { visit } from "unist-util-visit";
  import { getServerMember, MemberDetails, MemberOrUserDetails, proxyURL } from "utils";
  import { SelectedServer } from "State";

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

  let content: string | null = null;
  $: {
    content = null;
    if (!text) content = "";
    else
      MarkdownRenderer(() => (tree) => {
        visit(
          tree,
          "element",
          (
            node: {
              type: "element";
              tagName: string;
              properties: {
                type: "spoiler" | "channel" | "timestamp" | "emoji" | "mention";
                match: string;
                arg1?: string;
              };
              children: Child[];
            },
            _,
            parent: { children: Child[]; properties: Record<string, string> }
          ) => {
            if (
              parent &&
              DENY_TAGS.includes(node.tagName.toLowerCase()) &&
              (node.tagName !== "img" || parent.properties?.type !== "emoji")
            ) {
              const i = parent.children.indexOf(node);
              if (i >= 0) parent.children.splice(i, 1);
              return void 0;
            }
            if (!node.properties.type) return void 0;
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
                        $SelectedServer?.channels.find((c) => c?._id == node.properties.match)
                          ?.name || "unknown-channel"
                      }`,
                    },
                  ],
                });
                break;
              case "emoji":
                node.children.push({
                  type: "element",
                  tagName: "img",
                  properties: {
                    src: proxyURL(
                      `https://autumn.revolt.chat/emojis/${node.properties.match}`,
                      "image"
                    ),
                    class: `inline object-contain ${
                      text?.trim() == `:${node.properties.match}:` ? "h-12 w-12" : "h-5 w-5"
                    } mt-1 align-middle`,
                  },
                });
                break;
              case "mention":
                node.children.push({
                  type: "element",
                  tagName: "span",
                  properties: {
                    class:
                      "inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm",
                    style: `color:${$Theme["accent"]};background-color:rgba(0,0,0,0.3);`,
                  },
                  children: [
                    {
                      type: "text",
                      value: "@",
                    },
                    {
                      type: "element",
                      tagName: "span",
                      properties: {
                        style: `color:${
                          MemberDetails(getServerMember($SelectedServer, node.properties.match))
                            ?.color || $Theme["accent"]
                        };`,
                      },
                      children: [
                        {
                          type: "text",
                          value: MemberOrUserDetails(
                            client.users.get(node.properties.match),
                            getServerMember($SelectedServer, node.properties.match)
                          )?.name,
                        },
                      ],
                    },
                  ],
                });
                break;
            }
          }
        );
      })
        .process(text)
        .then((c) => {
          content = String(c.value);
        });
  }
</script>

<div class="whitespace-pre-wrap {keepSpace && content ? 'min-h-[1rem]' : ''}">
  {#if content !== null}
    {@html content}
  {:else}
    {text}
  {/if}
</div>

<!-- just to make sure it 100% includes the classes for emojis/others in the bundle -->
{#if false}
  <div class="inline object-contain {false ? 'h-12 w-12' : 'h-5 w-5'} mt-1 align-middle" />
  <div class="inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm" />
{/if}

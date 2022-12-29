<script lang="ts">
  import { DENY_TAGS, MarkdownRenderer } from "./renderer";

  import { client } from "Client";
  import { SelectedServer } from "State";
  import { Theme } from "Theme";
  import { visit } from "unist-util-visit";
  import { getServerMember, MemberDetails, MemberOrUserDetails, proxyURL, UserColor } from "utils";

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
                type?: "spoiler" | "channel" | "timestamp" | "emoji" | "mention" | "link";
                match?: string;
                arg1?: string;

                href?: string;
                style?: string;
                class?: string;
                target?: "_blank";
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
            if (node.tagName == "a") {
              if (!node.properties.href?.match(/^https?/gi)) delete node.properties.href;
              else {
                node.properties.style = `color:${$Theme["accent"]};`;
                node.properties.class = "inline-block hover:brightness-75 active:translate-y-[1px]";
                node.properties.type = "link";
                node.properties.target = "_blank";
              }
              return void 0;
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
                const member = getServerMember($SelectedServer, node.properties.match),
                  details = MemberDetails(member);
                node.children.push({
                  type: "element",
                  tagName: "span",
                  properties: {
                    class:
                      "inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm relative",
                    style: `color:${$Theme["accent"]};`,
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
  <!-- a -->
  <div class="inline-block hover:brightness-75 active:translate-y-[1px]" />
  <!-- emoji -->
  <div class="inline object-contain {false ? 'h-12 w-12' : 'h-5 w-5'} mt-1 align-middle" />
  <!-- mention -->
  <div
    class="inline-flex gap-0.5 items-center rounded-full px-1.5 font-semibold text-sm relative pointer-events-none"
  />
  <div
    class="absolute top-0 left-0 w-full h-full rounded-[inherit] opacity-10 hover:opacity-25 cursor-pointer"
  />
{/if}

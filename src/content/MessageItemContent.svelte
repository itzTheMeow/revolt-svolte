<script lang="ts">
  import type { Message } from "revolt.js";
  import { MarkdownRenderer } from "./markdown/renderer";

  import { client } from "Client";
  import { Theme } from "Theme";
  import { visit } from "unist-util-visit";
  import { getServerMember, MemberOrUserDetails } from "utils";
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

  export let message: Message;

  let content: string | null = null;
  $: {
    content = null;
    if (!message.content) content = "";
    else
      MarkdownRenderer(() => (tree) => {
        visit(
          tree,
          "element",
          (node: {
            type: "element";
            tagName: string;
            properties: {
              type: "spoiler" | "channel" | "timestamp" | "emoji" | "mention";
              match: string;
              arg1?: string;
            };
            children: Child[];
          }) => {
            if (!node.properties.type) return void 0;
            switch (node.properties.type) {
              case "mention":
                node.children.push({
                  type: "element",
                  tagName: "span",
                  properties: {
                    style: `color:${$Theme["accent"]};`,
                  },
                  children: [
                    {
                      type: "text",
                      value: `@${
                        MemberOrUserDetails(
                          client.users.get(node.properties.match),
                          getServerMember($SelectedServer, node.properties.match)
                        )?.name
                      }`,
                    },
                  ],
                });
                break;
            }
          }
        );
      })
        .process(message.content)
        .then((c) => {
          content = String(c.value);
        });
  }
</script>

<div class="whitespace-pre-wrap">
  {#if content !== null}
    {@html content}
  {:else}
    {message.content}
  {/if}
</div>

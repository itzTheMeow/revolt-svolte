import "katex/dist/katex.min.css";
import { unified, type Plugin } from "unified";
import createComponent from "./createComponent";

import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkHtmlToText } from "./htmlToText";

import remarkRehype from "remark-rehype";
import { handlers } from "./handlers";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import rehypeDomStringify from "rehype-dom-stringify";

import { client } from "../Client";
import { RevoltEmojiDictionary } from "revolt-toolset";
import { RE_MENTIONS } from "revolt.js";
import "./prism";

export const DENY_TAGS = [
  "img",
  "video",
  "figure",
  "picture",
  "source",
  "audio",
  "script",
  "style",
];

export const MarkdownRenderer = (plugin?: Plugin) => {
  const ren = unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkMath)
    .use(createComponent("spoiler", /!!([^!]+)!!/g))
    .use(createComponent("channel", /<#([A-z0-9]{26})>/g, (match) => client.channels.has(match)))
    .use(createComponent("timestamp", /<t:([0-9]+)(?::(\w))?>/g))
    .use(
      createComponent(
        "emoji",
        /:([a-zA-Z0-9_+]+):/g,
        (match) =>
          match in RevoltEmojiDictionary || /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(match)
      )
    )
    .use(createComponent("mention", RE_MENTIONS, (match) => client.users.has(match)))
    .use(remarkHtmlToText)
    .use(remarkRehype, {
      handlers,
    })
    .use(rehypeKatex, {
      maxSize: 10,
      maxExpand: 0,
      trust: false,
      strict: false,
      output: "html",
      throwOnError: false,
      errorColor: "var(--error)",
    })
    .use(rehypePrism);
  return (plugin ? ren.use(plugin) : ren).use(rehypeDomStringify);
};

import "katex/dist/katex.min.css";
import rehypeDomStringify from "rehype-dom-stringify";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { RevoltEmojiDictionary, RE_MENTIONS } from "revolt-toolset";
import { unified, type Plugin } from "unified";
import { client } from "../Client";
import createComponent from "./createComponent";
import { handlers } from "./handlers";
import { remarkHtmlToText } from "./htmlToText";
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

export const CUSTOM_EMOJI_REGEX = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;
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
        (match) => match in RevoltEmojiDictionary || CUSTOM_EMOJI_REGEX.test(match)
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

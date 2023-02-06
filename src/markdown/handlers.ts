import { DateTime } from "luxon";
import type { Handler } from "mdast-util-to-hast";
import { FULL_DATE_FORMAT } from "utils";

export const passThroughRehype: (name: string) => Handler = (name: string) => (h, node) =>
  h(node, name, node);
export const passThroughComponents = (...keys: string[]) => {
  const obj: Record<string, Handler> = {};
  for (const key of keys) {
    obj[key] = passThroughRehype(key);
  }
  return obj;
};

export const handlers = {
  ...passThroughComponents("emoji", "spoiler", "mention", "channel"),
  timestamp: <Handler>((h, { match, arg1 }) => {
    if (isNaN(match)) return { type: "text", value: match };
    const date = DateTime.fromMillis(match * 1000);

    let value = "";
    switch (arg1) {
      case "t":
        value = date.toFormat("hh:mm");
        break;
      case "T":
        value = date.toFormat("hh:mm:ss");
        break;
      case "R":
        value = date.toRelative() || "unknown time";
        break;
      case "D":
        value = date.toFormat("dd LLLL yyyy");
        break;
      case "F":
        value = date.toFormat("cccc, dd LLLL yyyy hh:mm");
        break;
      default:
        value = date.toFormat("dd LLLL yyyy hh:mm");
        break;
    }

    return h(null, "code", { title: date.toFormat(FULL_DATE_FORMAT) }, [{ type: "text", value }]);
  }),
};

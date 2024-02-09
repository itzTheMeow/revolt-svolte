import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export default function createComponent(
	type: string,
	regex: RegExp,
	validator?: (match: string) => boolean,
): Plugin {
	/**
	 * Plugin which transforms a given RegExp into a custom component with given name.
	 */
	return () => {
		return (tree) => {
			visit(tree, "text", (node: { value: string }, index: number, parent: { children: any[] }) => {
				const result = [];
				let start = 0;

				regex.lastIndex = 0;

				let match = regex.exec(node.value);

				while (match) {
					if (!validator || validator(match[1])) {
						const position = match.index;

						if (start !== position) {
							result.push({
								type: "text",
								value: node.value.slice(start, position),
							});
						}

						result.push({
							type,
							match: match[1],
							arg1: match[2],
						});
						start = position + match[0].length;
					}

					match = regex.exec(node.value);
				}

				if (result.length > 0 && parent && typeof index === "number") {
					if (start < node.value.length) {
						result.push({
							type: "text",
							value: node.value.slice(start),
						});
					}

					parent.children.splice(index, 1, ...result);
					return index + result.length;
				}
			});
		};
	};
}

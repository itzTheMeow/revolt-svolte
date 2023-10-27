import type { DefaultEmoji, Emoji, Member } from "revkit";
import { writable } from "svelte/store";

type FloatingMenuState = {
	pos: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	};
	target?: HTMLElement | EventTarget | null;
} & (
	| { type: "member"; member: Member; bar?: true }
	| { type: "emoji"; emoji: Emoji | DefaultEmoji }
	| { type: "emoji_picker"; cursor: number; input: HTMLInputElement | HTMLTextAreaElement }
);
export const floatingMenu = writable<FloatingMenuState | null>(null);

export function showMemberContext(
	member: Member,
	x: number,
	y: number,
	target?: EventTarget | HTMLElement | null,
) {
	const isTop = y <= window.innerHeight / 2;
	floatingMenu.set({
		type: "member",
		pos: {
			[isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
			left: x,
		},
		member,
		target,
	});
}
export function showEmojiContext(
	emoji: Emoji | DefaultEmoji,
	x: number,
	y: number,
	target?: EventTarget | HTMLElement | null,
) {
	const isTop = y <= window.innerHeight / 2;
	floatingMenu.set({
		type: "emoji",
		pos: {
			[isTop ? "top" : "bottom"]: isTop ? y : window.innerHeight - y,
			left: x,
		},
		emoji,
		target,
	});
}

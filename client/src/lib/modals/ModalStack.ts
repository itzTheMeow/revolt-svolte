import { BaseMessage, Channel, Server } from "revkit";
import type { BaseObject } from "revkit/dist/es6/objects/BaseObject";
import { writable } from "svelte/store";
import type { SettingsPage, SettingsServerPage } from "./Settings";

export type ModalData =
	| { type: "markdown"; title?: string; content: string }
	| {
			type: "confirm";
			title: string;
			text: string;
			confirm?: string;
			cancel?: string;
			red?: boolean;
			confirmed?: () => any;
			canceled?: () => any;
	  }
	| { type: "user"; id: string }
	| { type: "settings"; page: SettingsPage }
	| { type: "settings_server"; server: Server; page: SettingsServerPage }
	| {
			type: "crop";
			file: File;
			done?: (cropped: File) => any;
			canceled?: () => any;
			aspect?: number;
			round?: boolean;
	  };
export interface Modal {
	close(): void;
	container: HTMLDivElement | null;
}

export const ModalStack = new (class {
	public readonly stack = writable<ModalData[]>([]);

	constructor() {}

	public async getStack() {
		return new Promise<ModalData[]>((r) => this.stack.update((s) => (r(s), s)));
	}
	public async top() {
		return (await this.getStack()).slice(-1)[0];
	}
	public push(item: ModalData) {
		this.stack.update((stk) => {
			stk.push(item);
			return stk;
		});
	}
	public update() {
		this.stack.update((s) => s);
	}
	public close(item: ModalData) {
		this.stack.update((stk) => {
			const i = stk.indexOf(item);
			if (i >= 0) stk.splice(i, 1);
			return stk;
		});
	}

	public showDeleteModal(item: BaseObject<any> & { delete(): any }) {
		const term = (() => {
			if (item instanceof BaseMessage) return "Message";
			else if (item instanceof Channel) return "Channel";
			else return "Item";
		})();
		this.push({
			type: "confirm",
			title: `Delete ${term}`,
			text: `Are you sure you want to delete this ${term.toLowerCase()}?`,
			confirm: "Delete",
			red: true,
			confirmed() {
				item.delete();
			},
		});
	}
})();

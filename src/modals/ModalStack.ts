import { writable } from "svelte/store";
import type { SettingsPage } from "./Settings";

export type ModalData =
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
  | { type: "settings"; page: SettingsPage };
export interface Modal {
  close(): void;
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
})();

import { writable } from "svelte/store";

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
  | { type: "user"; id: string };
export interface Modal {
  close(): void;
}

export const ModalStack = new (class {
  public readonly stack = writable<ModalData[]>([]);

  constructor() {}

  public push(item: ModalData) {
    this.stack.update((stk) => {
      stk.push(item);
      return stk;
    });
  }
  public close(item: ModalData) {
    this.stack.update((stk) => {
      const i = stk.indexOf(item);
      if (i >= 0) stk.splice(i, 1);
      return stk;
    });
  }
})();

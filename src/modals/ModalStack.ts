import { writable } from "svelte/store";

export type ModalData = {
  type: "confirm";
  text: string;
  red?: boolean;
};

export const ModalStack = new (class {
  private stack = writable<ModalData[]>([]);

  constructor() {}
})();

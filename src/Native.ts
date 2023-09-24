import { writable } from "svelte/store";

declare global {
  interface Window {
    isNative?: boolean;
    nativeVersion?: string;
    native?: {
      min(): Promise<void>;
      max(): Promise<void>;
      close(): Promise<void>;
      reload(): Promise<void>;
      relaunch(): Promise<void>;
      getConfig(): Promise<NativeConfig>;
      getAutoStart(): Promise<boolean>;
      set(key: string, value: any): Promise<void>;
      isMaximized(): Promise<boolean>;
      enableAutoStart(): Promise<boolean>;
      disableAutoStart(): Promise<boolean>;
    };
  }
}

/** Config for the desktop app. */
interface NativeConfig {
  frame: boolean;
  build: string;
  discordRPC: boolean;
  minimiseToTray: boolean;
  hardwareAcceleration: boolean;
  customOpener: string;
}
/** Bridge to the native functions of the desktop app. */
export const Native = {
  isNative: !!window.isNative,
  nativeVersion: window.nativeVersion || "",
  titlebarHeight: 28,
  min: () => window.native?.min(),
  max: () => window.native?.max(),
  close: () => window.native?.close(),
  reload: () => window.native?.reload(),
  relaunch: () => window.native?.relaunch(),
  getConfig: () => window.native?.getConfig(),
  getAutoStart: () => window.native?.getAutoStart(),
  set: <K extends keyof NativeConfig>(k: K, v: NativeConfig[K]) => window.native?.set(k, v),
  isMaximized: async () => !!(await window.native?.isMaximized?.()),
  enableAutoStart: () => window.native?.enableAutoStart(),
  disableAutoStart: () => window.native?.disableAutoStart(),
};
export const ElectronFullscreen = writable(false);
if (Native.isNative) Native.isMaximized().then((m) => ElectronFullscreen.set(m));

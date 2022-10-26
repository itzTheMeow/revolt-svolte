import { writable } from "svelte/store";

interface NativeConfig {
  frame: boolean;
  build: string;
  discordRPC: boolean;
  minimiseToTray: boolean;
  hardwareAcceleration: boolean;
  customOpener: string;
}
export const Native = {
  isNative: (window as any).isNative,
  nativeVersion: (window as any).nativeVersion,
  titlebarHeight: 28,
  min: () => (window as any).native.min(),
  max: () => (window as any).native.max(),
  close: () => (window as any).native.close(),
  reload: () => (window as any).native.reload(),
  relaunch: () => (window as any).native.relaunch(),
  getConfig: () => (window as any).native.getConfig(),
  getAutoStart: () => (window as any).native.getAutoStart(),
  set: (k: string, v: any) => (window as any).native.set(k, v),
  isMaximized: (): Promise<boolean> => (window as any).native.isMaximized(),
  enableAutoStart: () => (window as any).native.enableAutoStart(),
  disableAutoStart: () => (window as any).native.disableAutoStart(),
};
export const ElectronFullscreen = writable(false);
Native.isMaximized().then((m) => ElectronFullscreen.set(m));

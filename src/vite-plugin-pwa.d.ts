declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';
  
  export interface ManifestOptions {
    name?: string;
    short_name?: string;
    description?: string;
    theme_color?: string;
    background_color?: string;
    display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
    orientation?: 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary';
    start_url?: string;
    icons?: Array<{
      src: string;
      sizes: string;
      type?: string;
      purpose?: string;
    }>;
    [key: string]: unknown;
  }

  export interface VitePWAPluginOptions {
    registerType?: 'autoUpdate' | 'prompt';
    injectRegister?: 'inline' | 'script' | 'auto' | null | false;
    devOptions?: {
      enabled?: boolean;
      type?: 'classic' | 'module';
      [key: string]: unknown;
    };
    workbox?: {
      globPatterns?: string[];
      maximumFileSizeToCacheInBytes?: number;
      skipWaiting?: boolean;
      clientsClaim?: boolean;
      [key: string]: unknown;
    };
    manifest?: ManifestOptions | false;
    includeAssets?: string[];
    strategies?: 'generateSW' | 'injectManifest';
    [key: string]: unknown;
  }

  export function VitePWA(options?: VitePWAPluginOptions): Plugin[];
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

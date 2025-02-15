interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropper {
  open(): Promise<EyeDropperResult>;
}

interface Window {
  EyeDropper: {
    new(): EyeDropper;
  };
}

declare const browser: typeof chrome;

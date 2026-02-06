/**
 * Type declarations for qrcode library
 */
declare module 'qrcode' {
  export interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: string;
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  export function toString(text: string, options?: QRCodeOptions): Promise<string>;
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>;
}

/**
 * Type declarations for jsbarcode library
 */
declare module 'jsbarcode' {
  interface JsBarcodeOptions {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
    lineColor?: string;
    background?: string;
  }

  function JsBarcode(element: HTMLCanvasElement | string, text: string, options?: JsBarcodeOptions): void;
  export = JsBarcode;
}

/**
 * Type declarations for marked library
 */
declare module 'marked' {
  export function marked(text: string): string;
}

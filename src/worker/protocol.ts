import type { Mosaic, MosaicSettings } from '../core/mosaic';

export type WorkerRequest =
  | { readonly type: 'source'; readonly sourceId: number; readonly bitmap: ImageBitmap }
  | {
      readonly type: 'render';
      readonly requestId: number;
      readonly sourceId: number;
      readonly settings: MosaicSettings;
    };

export type WorkerResponse =
  | { readonly type: 'result'; readonly requestId: number; readonly mosaic: Mosaic }
  | { readonly type: 'error'; readonly requestId: number; readonly message: string };

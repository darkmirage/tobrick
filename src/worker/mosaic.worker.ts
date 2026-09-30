import { gridSize } from '../core/dimensions';
import { buildMosaic } from '../core/mosaic';
import { downsample, type PixelGrid } from '../core/sample';
import type { WorkerRequest, WorkerResponse } from './protocol';

/** Caps the intermediate canvas so huge photos don't allocate hundreds of megabytes. */
const MAX_SAMPLE_PIXELS = 4_000_000;
/** Supersampling per cell edge; beyond this, extra source pixels no longer change the average. */
const MAX_SAMPLES_PER_CELL = 8;
const MAX_CACHED_GRIDS = 8;

let source: { id: number; bitmap: ImageBitmap } | null = null;
const sampledGrids = new Map<string, PixelGrid>();

function sample(bitmap: ImageBitmap, cols: number, rows: number): PixelGrid {
  const key = `${cols}x${rows}`;
  const cached = sampledGrids.get(key);
  if (cached) {
    return cached;
  }

  const perCell = Math.max(
    1,
    Math.min(
      MAX_SAMPLES_PER_CELL,
      Math.floor(Math.sqrt(MAX_SAMPLE_PIXELS / (cols * rows))),
      Math.ceil(Math.max(bitmap.width / cols, bitmap.height / rows)),
    ),
  );
  const width = cols * perCell;
  const height = rows * perCell;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('2D canvas is unavailable in this browser');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  const grid = downsample(context.getImageData(0, 0, width, height), cols, rows);

  if (sampledGrids.size >= MAX_CACHED_GRIDS) {
    const oldest = sampledGrids.keys().next().value;
    if (oldest !== undefined) {
      sampledGrids.delete(oldest);
    }
  }
  sampledGrids.set(key, grid);
  return grid;
}

function post(response: WorkerResponse, transfer: Transferable[] = []) {
  self.postMessage(response, { transfer });
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === 'source') {
    source?.bitmap.close();
    source = { id: request.sourceId, bitmap: request.bitmap };
    sampledGrids.clear();
    return;
  }

  try {
    if (source?.id !== request.sourceId) {
      throw new Error('Image is no longer loaded');
    }
    const { bitmap } = source;
    const { settings } = request;
    const { cols, rows } = gridSize(bitmap.width, bitmap.height, settings.rows, settings.stacked);
    const mosaic = buildMosaic(sample(bitmap, cols, rows), settings);
    post({ type: 'result', requestId: request.requestId, mosaic }, [mosaic.cells.buffer]);
  } catch (error) {
    post({
      type: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

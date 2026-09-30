import type { Mosaic, MosaicSettings } from '../core/mosaic';
import type { WorkerRequest, WorkerResponse } from './protocol';

export class SupersededError extends Error {
  constructor() {
    super('A newer render replaced this one');
    this.name = 'SupersededError';
  }
}

interface Job {
  readonly sourceId: number;
  readonly settings: MosaicSettings;
  readonly resolve: (mosaic: Mosaic) => void;
  readonly reject: (error: Error) => void;
}

/**
 * Runs mosaic generation off the main thread. At most one render is in flight; while it runs, only
 * the most recent request is kept and older waiting ones are rejected with `SupersededError`, so
 * dragging a slider never builds a backlog.
 */
export class MosaicRenderer {
  private readonly worker = new Worker(new URL('./mosaic.worker.ts', import.meta.url), {
    type: 'module',
  });
  private nextSourceId = 1;
  private nextRequestId = 1;
  private inFlight: (Job & { requestId: number }) | null = null;
  private queued: Job | null = null;

  constructor() {
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.settle(event.data);
    };
    this.worker.onerror = (event) => {
      this.settle({
        type: 'error',
        requestId: this.inFlight?.requestId ?? -1,
        message: event.message || 'Mosaic worker failed',
      });
    };
  }

  /** Hands the bitmap to the worker; it is unusable on this thread afterwards. */
  setSource(bitmap: ImageBitmap): number {
    const sourceId = this.nextSourceId++;
    this.send({ type: 'source', sourceId, bitmap }, [bitmap]);
    return sourceId;
  }

  render(sourceId: number, settings: MosaicSettings): Promise<Mosaic> {
    return new Promise((resolve, reject) => {
      this.queued?.reject(new SupersededError());
      this.queued = { sourceId, settings, resolve, reject };
      this.pump();
    });
  }

  dispose() {
    this.worker.terminate();
    this.queued?.reject(new SupersededError());
    this.inFlight?.reject(new SupersededError());
    this.queued = null;
    this.inFlight = null;
  }

  private pump() {
    if (this.inFlight || !this.queued) {
      return;
    }
    const job = this.queued;
    this.queued = null;
    const requestId = this.nextRequestId++;
    this.inFlight = { ...job, requestId };
    this.send({ type: 'render', requestId, sourceId: job.sourceId, settings: job.settings });
  }

  private settle(response: WorkerResponse) {
    const job = this.inFlight;
    if (job?.requestId !== response.requestId) {
      return;
    }
    this.inFlight = null;
    if (response.type === 'result') {
      job.resolve(response.mosaic);
    } else {
      job.reject(new Error(response.message));
    }
    this.pump();
  }

  private send(request: WorkerRequest, transfer: Transferable[] = []) {
    this.worker.postMessage(request, { transfer });
  }
}

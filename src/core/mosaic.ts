import { planBuild, type BuildPlan } from './bricks';
import { colorById } from './palette';
import { quantize, type DitherMode } from './quantize';
import type { PixelGrid } from './sample';

export interface MosaicSettings {
  readonly rows: number;
  readonly stacked: boolean;
  readonly colorIds: readonly number[];
  readonly brickLengths: readonly number[];
  readonly dither: DitherMode;
}

export interface Mosaic {
  readonly cols: number;
  readonly rows: number;
  readonly stacked: boolean;
  /** Colour ID per cell, row-major. */
  readonly cells: Uint16Array;
  readonly build: BuildPlan;
}

/** Turns a grid already sampled to one pixel per brick cell into a mosaic and its build plan. */
export function buildMosaic(grid: PixelGrid, settings: MosaicSettings): Mosaic {
  const colorIds = [...new Set(settings.colorIds)];
  const indices = quantize(
    grid,
    colorIds.map((id) => colorById(id).rgb),
    settings.dither,
  );
  const cells = Uint16Array.from(indices, (i) => colorIds[i] ?? 0);
  return {
    cols: grid.width,
    rows: grid.height,
    stacked: settings.stacked,
    cells,
    build: planBuild(cells, grid.width, grid.height, settings.brickLengths, settings.stacked),
  };
}

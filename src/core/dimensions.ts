export const STUD_PITCH_MM = 8;
export const BRICK_HEIGHT_MM = 9.6;
/** How much taller a stacked brick's face is than it is wide per stud. */
export const STACKED_ASPECT = BRICK_HEIGHT_MM / STUD_PITCH_MM;

export const MIN_ROWS = 8;
export const MAX_ROWS = 200;
export const DEFAULT_ROWS = 64;

export type Units = 'metric' | 'imperial';

export interface GridSize {
  readonly cols: number;
  readonly rows: number;
}

export function clampRows(rows: number): number {
  if (!Number.isFinite(rows)) {
    return DEFAULT_ROWS;
  }
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.round(rows)));
}

/**
 * Stacked bricks are taller than they are wide, so the same image needs more columns per row than
 * a flat, studs-up mosaic to keep its proportions.
 */
export function gridSize(imageWidth: number, imageHeight: number, rows: number, stacked: boolean): GridSize {
  const cellAspect = stacked ? STACKED_ASPECT : 1;
  const cols = Math.max(1, Math.round((imageWidth / imageHeight) * rows * cellAspect));
  return { cols, rows };
}

export function physicalSizeMm({ cols, rows }: GridSize, stacked: boolean): { width: number; height: number } {
  return {
    width: cols * STUD_PITCH_MM,
    height: rows * (stacked ? BRICK_HEIGHT_MM : STUD_PITCH_MM),
  };
}

export function formatLength(mm: number, units: Units): string {
  if (units === 'metric') {
    return `${(mm / 10).toFixed(1)} cm`;
  }
  const totalInches = Math.round(mm / 25.4);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return feet > 0 ? `${feet}′ ${inches}″` : `${inches}″`;
}

import { STACKED_ASPECT } from '../core/dimensions';
import type { Mosaic } from '../core/mosaic';
import { colorById, cssColor } from '../core/palette';

/** Longest canvas edge; enough detail to zoom into while keeping the bitmap cheap. */
const TARGET_EDGE_PX = 2400;
const MIN_STUD_CELL_PX = 6;

export function drawMosaic(canvas: HTMLCanvasElement, mosaic: Mosaic): void {
  const aspect = mosaic.stacked ? STACKED_ASPECT : 1;
  const cell = Math.max(
    2,
    Math.min(24, Math.floor(TARGET_EDGE_PX / Math.max(mosaic.cols, mosaic.rows * aspect))),
  );
  const cellHeight = cell * aspect;
  canvas.width = mosaic.cols * cell;
  canvas.height = Math.round(mosaic.rows * cellHeight);

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const outline = Math.max(1, Math.round(cell / 12));
  mosaic.build.rows.forEach((row, y) => {
    const top = Math.round(y * cellHeight);
    const height = Math.round((y + 1) * cellHeight) - top;
    for (const brick of row) {
      context.fillStyle = cssColor(colorById(brick.colorId).rgb);
      context.fillRect(brick.start * cell, top, brick.length * cell, height);
      if (cell >= 4) {
        context.fillStyle = 'rgb(0 0 0 / 0.18)';
        context.fillRect(brick.start * cell, top + height - outline, brick.length * cell, outline);
        context.fillRect((brick.start + brick.length) * cell - outline, top, outline, height);
      }
    }
  });

  // Studs are only visible when looking down on the bricks.
  if (!mosaic.stacked && cell >= MIN_STUD_CELL_PX) {
    const radius = cell * 0.3;
    context.lineWidth = Math.max(1, cell / 16);
    for (let y = 0; y < mosaic.rows; y++) {
      for (let x = 0; x < mosaic.cols; x++) {
        const cx = (x + 0.5) * cell;
        const cy = (y + 0.5) * cell;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.strokeStyle = 'rgb(0 0 0 / 0.22)';
        context.stroke();
        context.beginPath();
        context.arc(cx, cy, radius, Math.PI * 1.05, Math.PI * 1.7);
        context.strokeStyle = 'rgb(255 255 255 / 0.35)';
        context.stroke();
      }
    }
  }
}

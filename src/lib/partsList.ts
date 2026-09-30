import type { BuildPlan } from '../core/bricks';
import { colorById } from '../core/palette';

/** LEGO design IDs for 1 x N bricks, for ordering from Pick a Brick or BrickLink. */
export const BRICK_DESIGN_IDS: Readonly<Record<number, string>> = {
  1: '3005',
  2: '3004',
  3: '3622',
  4: '3010',
  6: '3009',
  8: '3008',
  10: '6111',
  12: '6112',
  16: '2465',
};

function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function partsListCsv(build: BuildPlan): string {
  const lines = [['Design ID', 'Brick', 'Colour ID', 'Colour', 'Quantity']];
  for (const part of build.parts) {
    lines.push([
      BRICK_DESIGN_IDS[part.length] ?? '',
      `1 x ${part.length}`,
      String(part.colorId),
      colorById(part.colorId).name,
      String(part.count),
    ]);
  }
  return lines.map((line) => line.map(csvField).join(',')).join('\n') + '\n';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

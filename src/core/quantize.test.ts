import { describe, expect, it } from 'vitest';
import type { Rgb } from './palette';
import { quantize, type DitherMode } from './quantize';
import type { PixelGrid } from './sample';

function solid(width: number, height: number, [r, g, b]: Rgb): PixelGrid {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data.set([r, g, b, 255], i);
  }
  return { width, height, data };
}

function gradient(width: number): PixelGrid {
  const data = new Uint8ClampedArray(width * 4);
  for (let x = 0; x < width; x++) {
    const v = Math.round((x / (width - 1)) * 255);
    data.set([v, v, v, 255], x * 4);
  }
  return { width, height: 1, data };
}

const BLACK_WHITE: Rgb[] = [
  [0, 0, 0],
  [255, 255, 255],
];
const MODES: DitherMode[] = ['none', 'ordered', 'floyd-steinberg'];

describe('quantize', () => {
  it.each(MODES)('maps an exact palette colour to itself (%s)', (mode) => {
    const palette: Rgb[] = [
      [196, 40, 27],
      [13, 105, 171],
      [245, 205, 47],
    ];
    const out = quantize(solid(6, 6, [13, 105, 171]), palette, mode);
    expect([...out].every((i) => i === 1)).toBe(true);
  });

  it('matches perceptually: dark grey goes to black, not to a saturated colour', () => {
    const palette: Rgb[] = [
      [27, 42, 52],
      [196, 40, 27],
      [242, 243, 242],
    ];
    const out = quantize(solid(1, 1, [60, 60, 60]), palette, 'none');
    expect(out[0]).toBe(0);
  });

  it('dithers perceptual mid grey to a mix of black and white', () => {
    for (const mode of ['ordered', 'floyd-steinberg'] as const) {
      // sRGB 99 is linear 0.125, which is OKLab lightness 0.5.
      const out = quantize(solid(16, 16, [99, 99, 99]), BLACK_WHITE, mode);
      const whites = out.reduce((n, i) => n + i, 0);
      expect(whites).toBeGreaterThan(out.length * 0.2);
      expect(whites).toBeLessThan(out.length * 0.8);
    }
  });

  it('preserves the direction of a gradient under error diffusion', () => {
    const out = quantize(gradient(64), BLACK_WHITE, 'floyd-steinberg');
    const left = out.slice(0, 16).reduce((n, i) => n + i, 0);
    const right = out.slice(48).reduce((n, i) => n + i, 0);
    expect(left).toBeLessThan(right);
  });

  it('rejects an empty palette', () => {
    expect(() => quantize(solid(1, 1, [0, 0, 0]), [], 'none')).toThrow();
  });
});

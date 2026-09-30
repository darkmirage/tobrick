import { linearRgbToOklab, srgbToLinear, srgbToOklab, type Lab } from './color';
import type { Rgb } from './palette';
import type { PixelGrid } from './sample';

export type DitherMode = 'none' | 'ordered' | 'floyd-steinberg';

export const DITHER_MODES: readonly { value: DitherMode; label: string }[] = [
  { value: 'floyd-steinberg', label: 'Smooth' },
  { value: 'ordered', label: 'Pattern' },
  { value: 'none', label: 'None' },
];

const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * Spread of the ordered-dither threshold in OKLab lightness, about the gap between neighbouring
 * brick greys. Thresholding in the same space as the match keeps mid-tones balanced.
 */
const ORDERED_SPREAD = 0.12;

/**
 * Full-strength diffusion over a handful of brick colours produces busy speckle; bleeding most,
 * not all, of the error keeps gradients while leaving flat areas flat.
 */
const DIFFUSION_STRENGTH = 0.85;

class NearestColor {
  private readonly labs: Float64Array;
  private readonly cache = new Map<number, number>();

  constructor(palette: readonly Rgb[]) {
    if (palette.length === 0) {
      throw new Error('Palette must contain at least one colour');
    }
    this.labs = new Float64Array(palette.length * 3);
    palette.forEach((rgb, i) => {
      this.labs.set(srgbToOklab(rgb), i * 3);
    });
  }

  ofLab(l: number, a: number, b: number): number {
    const labs = this.labs;
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0, j = 0; j < labs.length; i++, j += 3) {
      const dl = l - (labs[j] ?? 0);
      const da = a - (labs[j + 1] ?? 0);
      const db = b - (labs[j + 2] ?? 0);
      const distance = dl * dl + da * da + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best;
  }

  /** Memoised, since photos revisit the same sRGB values often. */
  ofSrgb(r: number, g: number, b: number): number {
    const key = (r << 16) | (g << 8) | b;
    let index = this.cache.get(key);
    if (index === undefined) {
      const [l, a, bb] = linearRgbToOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
      index = this.ofLab(l, a, bb);
      this.cache.set(key, index);
    }
    return index;
  }

  lab(index: number): Lab {
    const j = index * 3;
    return [this.labs[j] ?? 0, this.labs[j + 1] ?? 0, this.labs[j + 2] ?? 0];
  }
}

/** Maps every pixel of `grid` to the index of a palette colour. */
export function quantize(grid: PixelGrid, palette: readonly Rgb[], dither: DitherMode): Uint8Array {
  if (palette.length > 256) {
    throw new Error('Palette is limited to 256 colours');
  }
  const nearest = new NearestColor(palette);
  switch (dither) {
    case 'none':
      return quantizeFlat(grid, nearest);
    case 'ordered':
      return quantizeOrdered(grid, nearest);
    case 'floyd-steinberg':
      return quantizeDiffused(grid, nearest);
  }
}

function quantizeFlat(grid: PixelGrid, nearest: NearestColor): Uint8Array {
  const { width, height, data } = grid;
  const out = new Uint8Array(width * height);
  for (let p = 0, i = 0; p < width * height; p++, i += 4) {
    out[p] = nearest.ofSrgb(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
  }
  return out;
}

function quantizeOrdered(grid: PixelGrid, nearest: NearestColor): Uint8Array {
  const { width, height, data } = grid;
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      const threshold = ((BAYER_4X4[(y % 4) * 4 + (x % 4)] ?? 0) + 0.5) / 16 - 0.5;
      const [l, a, b] = linearRgbToOklab(
        srgbToLinear(data[i] ?? 0),
        srgbToLinear(data[i + 1] ?? 0),
        srgbToLinear(data[i + 2] ?? 0),
      );
      out[p] = nearest.ofLab(l + threshold * ORDERED_SPREAD, a, b);
    }
  }
  return out;
}

/** Serpentine Floyd–Steinberg with the error carried in OKLab, so it diffuses perceptually. */
function quantizeDiffused(grid: PixelGrid, nearest: NearestColor): Uint8Array {
  const { width, height, data } = grid;
  const out = new Uint8Array(width * height);
  const lab = new Float64Array(width * height * 3);
  for (let p = 0, i = 0; p < width * height; p++, i += 4) {
    lab.set(
      linearRgbToOklab(
        srgbToLinear(data[i] ?? 0),
        srgbToLinear(data[i + 1] ?? 0),
        srgbToLinear(data[i + 2] ?? 0),
      ),
      p * 3,
    );
  }

  const spill = (x: number, y: number, weight: number, el: number, ea: number, eb: number) => {
    if (x < 0 || x >= width || y >= height) {
      return;
    }
    const j = (y * width + x) * 3;
    lab[j] = (lab[j] ?? 0) + el * weight;
    lab[j + 1] = (lab[j + 1] ?? 0) + ea * weight;
    lab[j + 2] = (lab[j + 2] ?? 0) + eb * weight;
  };

  for (let y = 0; y < height; y++) {
    const leftToRight = y % 2 === 0;
    const dir = leftToRight ? 1 : -1;
    for (let k = 0; k < width; k++) {
      const x = leftToRight ? k : width - 1 - k;
      const p = y * width + x;
      const j = p * 3;
      const l = lab[j] ?? 0;
      const a = lab[j + 1] ?? 0;
      const b = lab[j + 2] ?? 0;
      const index = nearest.ofLab(l, a, b);
      out[p] = index;

      const [pl, pa, pb] = nearest.lab(index);
      const el = (l - pl) * DIFFUSION_STRENGTH;
      const ea = (a - pa) * DIFFUSION_STRENGTH;
      const eb = (b - pb) * DIFFUSION_STRENGTH;
      spill(x + dir, y, 7 / 16, el, ea, eb);
      spill(x - dir, y + 1, 3 / 16, el, ea, eb);
      spill(x, y + 1, 5 / 16, el, ea, eb);
      spill(x + dir, y + 1, 1 / 16, el, ea, eb);
    }
  }
  return out;
}

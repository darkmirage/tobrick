import { linearToSrgb, srgbToLinear } from './color';

export interface PixelGrid {
  readonly width: number;
  readonly height: number;
  /** RGBA, row-major, four bytes per pixel. */
  readonly data: Uint8ClampedArray;
}

/**
 * Area-averages `source` down to `width` x `height` cells in linear light, composited over white
 * so transparent regions become white bricks rather than black ones.
 */
export function downsample(source: PixelGrid, width: number, height: number): PixelGrid {
  const out = new Uint8ClampedArray(width * height * 4);
  const { data, width: sw, height: sh } = source;

  for (let cy = 0; cy < height; cy++) {
    const y0 = Math.floor((cy * sh) / height);
    const y1 = Math.max(y0 + 1, Math.floor(((cy + 1) * sh) / height));
    for (let cx = 0; cx < width; cx++) {
      const x0 = Math.floor((cx * sw) / width);
      const x1 = Math.max(x0 + 1, Math.floor(((cx + 1) * sw) / width));

      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        let i = (y * sw + x0) * 4;
        for (let x = x0; x < x1; x++, i += 4) {
          const alpha = (data[i + 3] ?? 255) / 255;
          const white = 1 - alpha;
          r += srgbToLinear(data[i] ?? 0) * alpha + white;
          g += srgbToLinear(data[i + 1] ?? 0) * alpha + white;
          b += srgbToLinear(data[i + 2] ?? 0) * alpha + white;
          n++;
        }
      }

      const o = (cy * width + cx) * 4;
      out[o] = linearToSrgb(r / n);
      out[o + 1] = linearToSrgb(g / n);
      out[o + 2] = linearToSrgb(b / n);
      out[o + 3] = 255;
    }
  }

  return { width, height, data: out };
}

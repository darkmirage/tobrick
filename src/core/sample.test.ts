import { describe, expect, it } from 'vitest';
import { downsample } from './sample';

describe('downsample', () => {
  it('averages black and white in linear light, not in sRGB', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    const out = downsample({ width: 2, height: 1, data }, 1, 1);
    // Half-intensity light is sRGB ~188, not the naive 128.
    expect(out.data[0]).toBeGreaterThan(180);
    expect(out.data[0]).toBeLessThan(195);
  });

  it('composites transparent pixels over white', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 0]);
    const out = downsample({ width: 1, height: 1, data }, 1, 1);
    expect([...out.data]).toEqual([255, 255, 255, 255]);
  });

  it('produces the requested grid size even when upsampling', () => {
    const data = new Uint8ClampedArray(2 * 2 * 4).fill(255);
    const out = downsample({ width: 2, height: 2, data }, 5, 3);
    expect(out.width).toBe(5);
    expect(out.height).toBe(3);
    expect(out.data.length).toBe(5 * 3 * 4);
  });
});

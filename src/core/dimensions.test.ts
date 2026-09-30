import { describe, expect, it } from 'vitest';
import { clampRows, formatLength, gridSize, physicalSizeMm } from './dimensions';

describe('gridSize', () => {
  it('keeps the image aspect ratio for a flat mosaic', () => {
    expect(gridSize(1600, 800, 50, false)).toEqual({ cols: 100, rows: 50 });
  });

  it('adds columns for stacked bricks, which are taller than they are wide', () => {
    const { cols, rows } = gridSize(1000, 1000, 50, true);
    expect(cols).toBe(60);
    const size = physicalSizeMm({ cols, rows }, true);
    expect(size.width).toBeCloseTo(size.height, 0);
  });
});

describe('clampRows', () => {
  it('bounds and rounds user input', () => {
    expect(clampRows(3)).toBe(8);
    expect(clampRows(9999)).toBe(200);
    expect(clampRows(64.4)).toBe(64);
    expect(clampRows(Number.NaN)).toBe(64);
  });
});

describe('formatLength', () => {
  it('formats metric and imperial lengths', () => {
    expect(formatLength(512, 'metric')).toBe('51.2 cm');
    expect(formatLength(914.4, 'imperial')).toBe('3′ 0″');
    expect(formatLength(127, 'imperial')).toBe('5″');
  });
});

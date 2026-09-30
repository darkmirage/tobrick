import { describe, expect, it } from 'vitest';
import { normalizeLengths, planBuild, planRow } from './bricks';

const lengthsOf = (row: { length: number }[]) => row.map((b) => b.length);

describe('planRow', () => {
  it('uses the fewest bricks where greedy largest-first would not', () => {
    // Greedy 6 + 1 + 1 needs three bricks; 4 + 4 needs two.
    const row = planRow(new Array(8).fill(7), [6, 4, 1], null, 0);
    expect(lengthsOf(row).sort()).toEqual([4, 4]);
  });

  it('never lets a brick span a colour change', () => {
    const colors = [1, 1, 1, 2, 2, 1, 1, 1, 1];
    const row = planRow(colors, [8, 4, 2, 1], null, 0);
    for (const brick of row) {
      for (let x = brick.start; x < brick.start + brick.length; x++) {
        expect(colors[x]).toBe(brick.colorId);
      }
    }
    expect(row.reduce((sum, b) => sum + b.length, 0)).toBe(colors.length);
  });

  it('staggers joints against the row below when penalised', () => {
    const below = new Uint8Array(9);
    below[4] = 1;
    const row = planRow(new Array(8).fill(3), [4, 2, 1], below, 1.5);
    const joints = row.slice(1).map((b) => b.start);
    expect(joints).not.toContain(4);
  });
});

describe('planBuild', () => {
  it('counts every cell exactly once and totals the parts', () => {
    const width = 10;
    const height = 3;
    const cells = Array.from({ length: width * height }, (_, i) => (i % 7 < 4 ? 1 : 21));
    const plan = planBuild(cells, width, height, [4, 2], true);

    for (const row of plan.rows) {
      expect(row.reduce((sum, b) => sum + b.length, 0)).toBe(width);
    }
    expect(plan.parts.reduce((sum, p) => sum + p.count, 0)).toBe(plan.total);
    expect(plan.colorIds).toEqual([1, 21]);
    expect(plan.lengths.every((l) => [4, 2, 1].includes(l))).toBe(true);
  });

  it('avoids a straight vertical crack in a stacked single-colour wall', () => {
    const width = 8;
    const height = 4;
    const plan = planBuild(new Array(width * height).fill(1), width, height, [4, 2], true);
    for (let y = 0; y < height - 1; y++) {
      const upper = new Set(plan.rows[y]?.slice(1).map((b) => b.start));
      const lower = plan.rows[y + 1]?.slice(1).map((b) => b.start) ?? [];
      expect(lower.filter((j) => upper.has(j))).toEqual([]);
    }
  });
});

describe('normalizeLengths', () => {
  it('always includes 1x1 and sorts descending without duplicates', () => {
    expect(normalizeLengths([2, 8, 2, 0, -1, 1.5])).toEqual([8, 2, 1]);
  });
});

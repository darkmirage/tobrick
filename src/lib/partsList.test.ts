import { describe, expect, it } from 'vitest';
import { planBuild } from '../core/bricks';
import { partsListCsv } from './partsList';

describe('partsListCsv', () => {
  it('lists each colour and size with its design ID and quantity', () => {
    const build = planBuild([21, 21, 21, 21, 1, 1], 6, 1, [4, 2], false);
    expect(partsListCsv(build).trim().split('\n')).toEqual([
      'Design ID,Brick,Colour ID,Colour,Quantity',
      '3004,1 x 2,1,White,1',
      '3010,1 x 4,21,Bright Red,1',
    ]);
  });
});

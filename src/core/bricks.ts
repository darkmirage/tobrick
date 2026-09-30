export const ALL_BRICK_LENGTHS: readonly number[] = [16, 12, 10, 8, 6, 4, 3, 2, 1];
export const DEFAULT_BRICK_LENGTHS: readonly number[] = [12, 8, 6, 4, 3, 2, 1];

export interface PlacedBrick {
  readonly start: number;
  readonly length: number;
  readonly colorId: number;
}

export interface PartCount {
  readonly colorId: number;
  readonly length: number;
  readonly count: number;
}

export interface BuildPlan {
  /** Top row first, matching the image. */
  readonly rows: readonly (readonly PlacedBrick[])[];
  readonly parts: readonly PartCount[];
  readonly colorIds: readonly number[];
  readonly lengths: readonly number[];
  readonly total: number;
}

/**
 * Cost of a joint landing directly above a joint in the row beneath. Aligned joints are what let a
 * stacked wall split apart, so avoiding even one is worth an extra brick, as in a running bond.
 */
const STACKED_SEAM_PENALTY = 1.5;
/** Flat mosaics sit on a baseplate and have no structural need to stagger; this only breaks ties. */
const FLAT_SEAM_PENALTY = 0.001;

export function normalizeLengths(lengths: Iterable<number>): number[] {
  const set = new Set([...lengths].filter((n) => Number.isInteger(n) && n > 0));
  set.add(1);
  return [...set].sort((a, b) => b - a);
}

/**
 * Covers one row with bricks, minimising brick count plus a penalty for each joint that sits on a
 * joint in `jointsBelow`. Bricks never span a colour change.
 *
 * @param colors colour ID per cell
 * @param lengths available brick lengths, descending, including 1
 */
export function planRow(
  colors: ArrayLike<number>,
  lengths: readonly number[],
  jointsBelow: Uint8Array | null,
  seamPenalty: number,
): PlacedBrick[] {
  const width = colors.length;
  const runStart = new Int32Array(width);
  for (let x = 1; x < width; x++) {
    runStart[x] = colors[x] === colors[x - 1] ? (runStart[x - 1] ?? 0) : x;
  }

  const cost = new Float64Array(width + 1).fill(Infinity);
  const choice = new Int32Array(width + 1);
  cost[0] = 0;
  for (let end = 1; end <= width; end++) {
    const earliest = runStart[end - 1] ?? 0;
    const joint = end < width && jointsBelow?.[end] ? seamPenalty : 0;
    for (const length of lengths) {
      const start = end - length;
      if (start < earliest) {
        continue;
      }
      const candidate = (cost[start] ?? Infinity) + 1 + joint;
      if (candidate < (cost[end] ?? Infinity)) {
        cost[end] = candidate;
        choice[end] = length;
      }
    }
  }

  const bricks: PlacedBrick[] = [];
  for (let end = width; end > 0; ) {
    const length = choice[end] ?? 1;
    const start = end - length;
    bricks.push({ start, length, colorId: colors[start] ?? 0 });
    end = start;
  }
  return bricks.reverse();
}

/**
 * Plans the whole mosaic from the bottom row up, so each row can stagger its joints against the
 * row it will sit on.
 *
 * @param cells colour ID per cell, row-major
 */
export function planBuild(
  cells: ArrayLike<number>,
  width: number,
  height: number,
  availableLengths: Iterable<number>,
  stacked: boolean,
): BuildPlan {
  const lengths = normalizeLengths(availableLengths);
  const penalty = stacked ? STACKED_SEAM_PENALTY : FLAT_SEAM_PENALTY;
  const rows: PlacedBrick[][] = new Array<PlacedBrick[]>(height);
  const counts = new Map<number, Map<number, number>>();
  let total = 0;
  let jointsBelow: Uint8Array | null = null;

  for (let y = height - 1; y >= 0; y--) {
    const rowColors = Array.from({ length: width }, (_, x) => cells[y * width + x] ?? 0);
    const row = planRow(rowColors, lengths, jointsBelow, penalty);
    rows[y] = row;

    const joints = new Uint8Array(width + 1);
    for (const brick of row) {
      joints[brick.start] = 1;
      let byLength = counts.get(brick.colorId);
      if (!byLength) {
        byLength = new Map();
        counts.set(brick.colorId, byLength);
      }
      byLength.set(brick.length, (byLength.get(brick.length) ?? 0) + 1);
      total++;
    }
    jointsBelow = joints;
  }

  const parts: PartCount[] = [];
  for (const [colorId, byLength] of counts) {
    for (const [length, count] of byLength) {
      parts.push({ colorId, length, count });
    }
  }
  parts.sort((a, b) => a.colorId - b.colorId || b.length - a.length);

  return {
    rows,
    parts,
    colorIds: [...counts.keys()].sort((a, b) => a - b),
    lengths: [...new Set(parts.map((p) => p.length))].sort((a, b) => b - a),
    total,
  };
}

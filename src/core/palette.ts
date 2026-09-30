export type Rgb = readonly [r: number, g: number, b: number];

export interface BrickColor {
  /** LEGO element colour ID. */
  readonly id: number;
  readonly name: string;
  readonly rgb: Rgb;
  readonly isDefault: boolean;
  readonly isTransparent: boolean;
}

export const BRICK_COLORS: readonly BrickColor[] = [
  { id: 1, name: 'White', rgb: [242, 243, 242], isDefault: true, isTransparent: false },
  { id: 5, name: 'Brick Yellow', rgb: [215, 197, 153], isDefault: true, isTransparent: false },
  { id: 18, name: 'Nougat', rgb: [204, 142, 104], isDefault: false, isTransparent: false },
  { id: 21, name: 'Bright Red', rgb: [196, 40, 27], isDefault: true, isTransparent: false },
  { id: 23, name: 'Bright Blue', rgb: [13, 105, 171], isDefault: true, isTransparent: false },
  { id: 24, name: 'Bright Yellow', rgb: [245, 205, 47], isDefault: true, isTransparent: false },
  { id: 26, name: 'Black', rgb: [27, 42, 52], isDefault: true, isTransparent: false },
  { id: 28, name: 'Dark Green', rgb: [40, 127, 70], isDefault: true, isTransparent: false },
  { id: 37, name: 'Bright Green', rgb: [75, 151, 74], isDefault: false, isTransparent: false },
  { id: 38, name: 'Dark Orange', rgb: [160, 95, 52], isDefault: false, isTransparent: false },
  { id: 40, name: 'Transparent', rgb: [236, 236, 236], isDefault: false, isTransparent: true },
  { id: 41, name: 'Transparent Red', rgb: [205, 84, 75], isDefault: false, isTransparent: true },
  { id: 42, name: 'Transparent Light Blue', rgb: [193, 223, 240], isDefault: false, isTransparent: true },
  { id: 43, name: 'Transparent Blue', rgb: [123, 182, 232], isDefault: false, isTransparent: true },
  { id: 44, name: 'Transparent Yellow', rgb: [247, 241, 141], isDefault: false, isTransparent: true },
  { id: 47, name: 'Transparent Fluorescent Reddish Orange', rgb: [217, 133, 108], isDefault: false, isTransparent: true },
  { id: 48, name: 'Transparent Green', rgb: [132, 182, 141], isDefault: false, isTransparent: true },
  { id: 49, name: 'Transparent Fluorescent Green', rgb: [248, 241, 132], isDefault: false, isTransparent: true },
  { id: 102, name: 'Medium Blue', rgb: [110, 153, 201], isDefault: false, isTransparent: false },
  { id: 106, name: 'Bright Orange', rgb: [231, 99, 24], isDefault: true, isTransparent: false },
  { id: 111, name: 'Transparent Brown', rgb: [191, 183, 177], isDefault: false, isTransparent: true },
  { id: 113, name: 'Transparent Medium Reddish Violet', rgb: [228, 173, 200], isDefault: false, isTransparent: true },
  { id: 119, name: 'Bright Yellowish Green', rgb: [164, 189, 70], isDefault: false, isTransparent: false },
  { id: 124, name: 'Bright Reddish Violet', rgb: [146, 57, 120], isDefault: false, isTransparent: false },
  { id: 126, name: 'Transparent Bright Bluish Violet', rgb: [165, 165, 203], isDefault: false, isTransparent: true },
  { id: 135, name: 'Sand Blue', rgb: [116, 134, 156], isDefault: false, isTransparent: false },
  { id: 138, name: 'Sand Yellow', rgb: [149, 138, 115], isDefault: false, isTransparent: false },
  { id: 140, name: 'Earth Blue', rgb: [32, 58, 86], isDefault: false, isTransparent: false },
  { id: 141, name: 'Earth Green', rgb: [39, 70, 44], isDefault: false, isTransparent: false },
  { id: 143, name: 'Transparent Fluorescent Blue', rgb: [207, 226, 247], isDefault: false, isTransparent: true },
  { id: 151, name: 'Sand Green', rgb: [120, 144, 129], isDefault: false, isTransparent: false },
  { id: 154, name: 'Dark Red', rgb: [123, 46, 47], isDefault: false, isTransparent: false },
  { id: 182, name: 'Transparent Fluorescent Orange', rgb: [236, 118, 14], isDefault: false, isTransparent: true },
  { id: 191, name: 'Flame Yellowish Orange', rgb: [232, 171, 45], isDefault: false, isTransparent: false },
  { id: 192, name: 'Reddish Brown', rgb: [105, 64, 39], isDefault: true, isTransparent: false },
  { id: 194, name: 'Medium Stone Grey', rgb: [163, 162, 164], isDefault: true, isTransparent: false },
  { id: 199, name: 'Dark Stone Grey', rgb: [99, 95, 97], isDefault: true, isTransparent: false },
  { id: 208, name: 'Light Stone Grey', rgb: [229, 228, 222], isDefault: false, isTransparent: false },
  { id: 212, name: 'Light Royal Blue', rgb: [159, 195, 233], isDefault: false, isTransparent: false },
  { id: 221, name: 'Bright Purple', rgb: [205, 98, 152], isDefault: false, isTransparent: false },
  { id: 222, name: 'Light Purple', rgb: [228, 173, 200], isDefault: false, isTransparent: false },
  { id: 226, name: 'Cool Yellow', rgb: [253, 234, 140], isDefault: false, isTransparent: false },
  { id: 268, name: 'Medium Lilac', rgb: [52, 43, 117], isDefault: false, isTransparent: false },
  { id: 311, name: 'Transparent Bright Green', rgb: [153, 255, 102], isDefault: false, isTransparent: true },
  { id: 321, name: 'Dark Azur', rgb: [70, 155, 195], isDefault: false, isTransparent: false },
  { id: 322, name: 'Medium Azur', rgb: [104, 195, 226], isDefault: false, isTransparent: false },
  { id: 323, name: 'Aqua', rgb: [211, 242, 234], isDefault: false, isTransparent: false },
  { id: 324, name: 'Medium Lavender', rgb: [160, 110, 185], isDefault: false, isTransparent: false },
  { id: 325, name: 'Lavender', rgb: [205, 164, 222], isDefault: false, isTransparent: false },
  { id: 326, name: 'Spring Yellowish Green', rgb: [226, 249, 154], isDefault: false, isTransparent: false },
  { id: 330, name: 'Olive Green', rgb: [119, 119, 78], isDefault: false, isTransparent: false },
  { id: 331, name: 'Medium Yellowish Green', rgb: [150, 185, 59], isDefault: false, isTransparent: false },
];

const colorsById = new Map(BRICK_COLORS.map((color) => [color.id, color]));

export function colorById(id: number): BrickColor {
  const color = colorsById.get(id);
  if (!color) {
    throw new Error(`Unknown brick colour ${id}`);
  }
  return color;
}

export const DEFAULT_COLOR_IDS: readonly number[] = BRICK_COLORS.filter((c) => c.isDefault).map(
  (c) => c.id,
);

/** Transparent bricks read poorly in a mosaic, so they are not offered in the picker. */
export const SELECTABLE_COLORS: readonly BrickColor[] = BRICK_COLORS.filter((c) => !c.isTransparent);

export function isDark([r, g, b]: Rgb): boolean {
  return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
}

export function cssColor([r, g, b]: Rgb): string {
  return `rgb(${r} ${g} ${b})`;
}

export interface Sample {
  readonly url: string;
  readonly title: string;
  readonly colorIds?: readonly number[];
  readonly rows?: number;
}

const base = import.meta.env.BASE_URL;

/** Public-domain paintings, via Wikimedia Commons. */
export const SAMPLES: readonly Sample[] = [
  {
    url: `${base}samples/great-wave.jpg`,
    title: 'The Great Wave off Kanagawa',
    colorIds: [1, 5, 23, 24, 26, 140, 194, 199],
    rows: 80,
  },
  { url: `${base}samples/starry-night.jpg`, title: 'The Starry Night', rows: 80 },
  { url: `${base}samples/pearl-earring.jpg`, title: 'Girl with a Pearl Earring', rows: 96 },
  { url: `${base}samples/mona-lisa.jpg`, title: 'Mona Lisa', rows: 96 },
  { url: `${base}samples/sunflowers.jpg`, title: 'Sunflowers', rows: 96 },
];

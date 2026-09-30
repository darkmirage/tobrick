# Image to Brick

Turn any picture into a LEGO mosaic, with a parts list and row-by-row build instructions.
Everything runs in the browser; images are never uploaded.

## Development

Requires Node 22.12 or newer.

```sh
npm install
npm run dev      # http://localhost:5173
npm run check    # typecheck, lint and unit tests
npm run build    # static site in dist/
```

The build uses relative asset paths, so `dist/` can be served from any host or subpath, such as
GitHub Pages.

## How it works

1. **Sampling.** The image is drawn onto an `OffscreenCanvas` at a few pixels per brick, then
   area-averaged in linear light to one colour per stud (`src/core/sample.ts`). Transparent pixels
   become white.
2. **Colour matching.** Each cell is matched to the nearest selected brick colour in
   [OKLab](https://bottosson.github.io/posts/oklab/), a perceptual colour space. Optional dithering is
   serpentine Floyd–Steinberg, with error carried in OKLab, or a 4×4 Bayer pattern
   (`src/core/quantize.ts`).
3. **Brick fitting.** Each row is covered with the fewest bricks using dynamic programming, never
   spanning a colour change. In stacked mode the planner works from the bottom row up and penalises
   joints that land on joints below, which gives a running bond that holds together
   (`src/core/bricks.ts`).

Steps 1–3 run in a Web Worker (`src/worker/`), so the page stays responsive while you drag the
height slider; only the latest request is processed.

Stacked bricks are 9.6 mm tall on an 8 mm stud pitch, so stacked mosaics get more columns per row to
keep the image's proportions.

## Layout

- `src/core/`: pure, framework-free logic, with unit tests alongside
- `src/worker/`: the mosaic Web Worker and its promise-based client
- `src/components/`: React UI
- `src/lib/`: browser helpers (image loading, canvas drawing, parts-list export)
- `public/samples/`: public-domain sample paintings from Wikimedia Commons

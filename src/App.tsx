import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { DEFAULT_BRICK_LENGTHS } from './core/bricks';
import { clampRows, DEFAULT_ROWS, gridSize, type Units } from './core/dimensions';
import type { Mosaic, MosaicSettings } from './core/mosaic';
import { DEFAULT_COLOR_IDS } from './core/palette';
import { BrickPicker } from './components/BrickPicker';
import { ColorPicker } from './components/ColorPicker';
import { Instructions } from './components/Instructions';
import { MosaicPreview } from './components/MosaicPreview';
import { OptionsPanel } from './components/OptionsPanel';
import { ResultPanel } from './components/ResultPanel';
import { SourcePicker } from './components/SourcePicker';
import { loadImage } from './lib/source';
import { SAMPLES, type Sample } from './samples';
import { MosaicRenderer, SupersededError } from './worker/mosaicRenderer';

interface SourceImage {
  readonly sourceId: number;
  readonly key: string;
  readonly previewUrl: string;
  readonly width: number;
  readonly height: number;
}

type RenderOutcome =
  | { readonly sourceId: number; readonly settings: MosaicSettings; readonly mosaic: Mosaic }
  | { readonly sourceId: number; readonly settings: MosaicSettings; readonly error: string };

let sharedRenderer: MosaicRenderer | null = null;
const renderer = () => (sharedRenderer ??= new MosaicRenderer());

const INITIAL_SETTINGS: MosaicSettings = {
  rows: DEFAULT_ROWS,
  stacked: false,
  colorIds: DEFAULT_COLOR_IDS,
  brickLengths: DEFAULT_BRICK_LENGTHS,
  dither: 'floyd-steinberg',
};

/** Small images get one row per four source pixels so they aren't blown up into blur. */
const defaultRowsFor = (imageHeight: number) => clampRows(Math.min(DEFAULT_ROWS, imageHeight / 4));

export function App() {
  const [image, setImage] = useState<SourceImage | null>(null);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [units, setUnits] = useState<Units>('metric');
  const [outcome, setOutcome] = useState<RenderOutcome | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ownedUrl = useRef<string | null>(null);
  const loadToken = useRef(0);

  const loadSource = useCallback((input: string | File, key: string, preset?: Sample) => {
    const token = ++loadToken.current;
    loadImage(input).then(
      (loaded) => {
        if (token !== loadToken.current) {
          loaded.bitmap.close();
          if (loaded.ownedUrl) {
            URL.revokeObjectURL(loaded.ownedUrl);
          }
          return;
        }
        if (ownedUrl.current) {
          URL.revokeObjectURL(ownedUrl.current);
        }
        ownedUrl.current = loaded.ownedUrl;
        const { width, height, previewUrl } = loaded;
        const sourceId = renderer().setSource(loaded.bitmap);
        setLoadError(null);
        setImage({ sourceId, key, previewUrl, width, height });
        setSettings((current) => ({
          ...current,
          rows: preset?.rows ?? defaultRowsFor(height),
          colorIds: preset?.colorIds ?? DEFAULT_COLOR_IDS,
        }));
      },
      (error: unknown) => {
        if (token === loadToken.current) {
          setLoadError(error instanceof Error ? error.message : 'Could not read that image');
        }
      },
    );
  }, []);

  const loadSample = useCallback(
    (sample: Sample) => {
      loadSource(sample.url, sample.url, sample);
    },
    [loadSource],
  );
  const loadFile = useCallback(
    (file: File) => {
      loadSource(file, `file:${file.name}:${file.lastModified}`);
    },
    [loadSource],
  );

  useEffect(() => {
    const first = SAMPLES[0];
    if (first) {
      loadSource(first.url, first.url, first);
    }
  }, [loadSource]);

  useEffect(() => {
    if (!image) {
      return;
    }
    const { sourceId } = image;
    renderer()
      .render(sourceId, settings)
      .then(
        (mosaic) => {
          setOutcome({ sourceId, settings, mosaic });
        },
        (error: unknown) => {
          if (!(error instanceof SupersededError)) {
            setOutcome({ sourceId, settings, error: error instanceof Error ? error.message : String(error) });
          }
        },
      );
  }, [image, settings]);

  const current = outcome?.sourceId === image?.sourceId ? outcome : null;
  const mosaic = current && 'mosaic' in current ? current.mosaic : null;
  const renderError = current && 'error' in current ? current.error : null;
  const busy = !current || current.settings !== settings;
  const instructionsMosaic = useDeferredValue(mosaic);

  const update = (patch: Partial<MosaicSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  };

  return (
    <>
      <header id="top" className="site-header">
        <h1 className="logo">
          Image to <span className="red">B</span>
          <span className="blue">r</span>
          <span className="yellow">i</span>
          <span className="black">c</span>
          <span className="green">k</span>
        </h1>
        <p className="tagline">Turn any picture into a LEGO mosaic with build instructions.</p>
      </header>

      <main className="workspace">
        <aside className="toolbar">
          <SourcePicker samples={SAMPLES} currentUrl={image?.key ?? null} onSample={loadSample} onFile={loadFile} />
          <ResultPanel mosaic={mosaic} getCanvas={() => canvasRef.current} />
          <OptionsPanel
            rows={settings.rows}
            stacked={settings.stacked}
            dither={settings.dither}
            units={units}
            grid={image ? gridSize(image.width, image.height, settings.rows, settings.stacked) : null}
            onRows={(rows) => {
              update({ rows: clampRows(rows) });
            }}
            onStacked={(stacked) => {
              update({ stacked });
            }}
            onDither={(dither) => {
              update({ dither });
            }}
            onUnits={setUnits}
          />
          <BrickPicker
            selected={settings.brickLengths}
            onChange={(brickLengths) => {
              update({ brickLengths });
            }}
          />
          <ColorPicker
            selected={settings.colorIds}
            onChange={(colorIds) => {
              update({ colorIds });
            }}
          />
        </aside>

        <MosaicPreview
          mosaic={mosaic}
          originalUrl={image?.previewUrl ?? null}
          busy={busy}
          error={loadError ?? renderError}
          canvasRef={canvasRef}
          onDropFile={loadFile}
        />
      </main>

      {instructionsMosaic ? <Instructions mosaic={instructionsMosaic} /> : null}

      <footer className="site-footer">
        <p>
          Inspired by{' '}
          <a href="https://sailorhg.github.io/legoizer/" target="_blank" rel="noreferrer">
            Legoizer
          </a>
          . Sample paintings are public domain, via Wikimedia Commons. Images never leave your browser.
        </p>
        <p>
          <a href="https://github.com/darkmirage/tobrick" target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </p>
      </footer>
    </>
  );
}

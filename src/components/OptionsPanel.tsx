import { useState } from 'react';
import { clampRows, formatLength, MAX_ROWS, MIN_ROWS, physicalSizeMm, type GridSize, type Units } from '../core/dimensions';
import { DITHER_MODES, type DitherMode } from '../core/quantize';
import { Section } from './Section';

interface Props {
  rows: number;
  stacked: boolean;
  dither: DitherMode;
  units: Units;
  grid: GridSize | null;
  onRows: (rows: number) => void;
  onStacked: (stacked: boolean) => void;
  onDither: (dither: DitherMode) => void;
  onUnits: (units: Units) => void;
}

export function OptionsPanel({ rows, stacked, dither, units, grid, onRows, onStacked, onDither, onUnits }: Props) {
  // The text field keeps the user's draft so typing "1" on the way to "120" doesn't clamp to 8.
  const [draft, setDraft] = useState(String(rows));
  const [draftFor, setDraftFor] = useState(rows);
  if (draftFor !== rows) {
    setDraftFor(rows);
    setDraft(String(rows));
  }

  const commitDraft = () => {
    const next = clampRows(Number(draft));
    setDraft(String(next));
    onRows(next);
  };

  const size = grid ? physicalSizeMm(grid, stacked) : null;

  return (
    <Section
      title="Options"
      footer={
        grid && size ? (
          <>
            <strong>{grid.cols}</strong> × <strong>{grid.rows}</strong> studs, about{' '}
            <strong>
              {formatLength(size.width, units)} × {formatLength(size.height, units)}
            </strong>
          </>
        ) : null
      }
    >
      <div className="field">
        <label htmlFor="rows">Height in bricks</label>
        <div className="row-input">
          <input
            type="range"
            min={MIN_ROWS}
            max={MAX_ROWS}
            value={rows}
            aria-label="Height in bricks"
            onChange={(event) => {
              onRows(Number(event.target.value));
            }}
          />
          <input
            id="rows"
            type="number"
            inputMode="numeric"
            min={MIN_ROWS}
            max={MAX_ROWS}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitDraft();
              }
            }}
          />
        </div>
      </div>

      <div className="field">
        <span className="field-label">Build style</span>
        <div className="segmented" role="radiogroup" aria-label="Build style">
          <button type="button" role="radio" aria-checked={!stacked} onClick={() => { onStacked(false); }} title="Bricks lie studs-up on a baseplate">
            Flat
          </button>
          <button type="button" role="radio" aria-checked={stacked} onClick={() => { onStacked(true); }} title="Bricks stack into a standing wall">
            Stacked
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="dither">Dithering</label>
        <select
          id="dither"
          value={dither}
          onChange={(event) => {
            onDither(event.target.value as DitherMode);
          }}
        >
          {DITHER_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">Units</span>
        <div className="segmented" role="radiogroup" aria-label="Units">
          <button type="button" role="radio" aria-checked={units === 'metric'} onClick={() => { onUnits('metric'); }}>
            cm
          </button>
          <button type="button" role="radio" aria-checked={units === 'imperial'} onClick={() => { onUnits('imperial'); }}>
            ft / in
          </button>
        </div>
      </div>
    </Section>
  );
}

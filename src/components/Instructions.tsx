import { memo, useState } from 'react';
import type { BuildPlan, PlacedBrick } from '../core/bricks';
import { STACKED_ASPECT } from '../core/dimensions';
import type { Mosaic } from '../core/mosaic';
import { colorById, cssColor, isDark } from '../core/palette';

const STUD_PX = 14;

export const Instructions = memo(function Instructions({ mosaic }: { mosaic: Mosaic }) {
  const [showLabels, setShowLabels] = useState(true);
  const rowHeight = Math.round(STUD_PX * (mosaic.stacked ? STACKED_ASPECT : 1)) + 4;
  const rowCount = mosaic.build.rows.length;

  return (
    <section id="instructions" className="instructions">
      <h2 className="section-heading">Build instructions</h2>
      <PartsTable build={mosaic.build} />

      <div className="instructions-controls">
        <a className="button" href="#top">
          Back to top
        </a>
        <button type="button" className="button" onClick={() => { setShowLabels(!showLabels); }}>
          {showLabels ? 'Hide brick sizes' : 'Show brick sizes'}
        </button>
      </div>
      <p className="hint">
        Rows are numbered from the bottom{mosaic.stacked ? ', the order you stack them' : ''}. Each label is
        the brick's length in studs.
      </p>

      <div
        className="build-rows"
        data-labels={showLabels || undefined}
        style={{ ['--row-height' as string]: `${rowHeight}px`, ['--stud' as string]: `${STUD_PX}px` }}
      >
        {mosaic.build.rows.map((row, index) => (
          <BuildRow key={index} row={row} rowNumber={rowCount - index} />
        ))}
      </div>
    </section>
  );
});

const BuildRow = memo(function BuildRow({ row, rowNumber }: { row: readonly PlacedBrick[]; rowNumber: number }) {
  return (
    <div className="build-row">
      <span className="build-row-number">{rowNumber}</span>
      {row.map((brick, position) => {
        const color = colorById(brick.colorId);
        return (
          <span
            key={brick.start}
            className="build-brick"
            title={`${color.name} 1 × ${brick.length}, position ${position + 1} of row ${rowNumber}`}
            style={{
              width: `calc(var(--stud) * ${brick.length})`,
              backgroundColor: cssColor(color.rgb),
              color: isDark(color.rgb) ? '#fff' : '#000',
            }}
          >
            {brick.length}
          </span>
        );
      })}
      <span className="build-row-number">{rowNumber}</span>
    </div>
  );
});

function PartsTable({ build }: { build: BuildPlan }) {
  const counts = new Map(build.parts.map((p) => [`${p.length}:${p.colorId}`, p.count]));
  const count = (length: number, colorId: number) => counts.get(`${length}:${colorId}`) ?? 0;

  return (
    <div className="table-scroll">
      <table className="parts-table">
        <thead>
          <tr>
            <th scope="col">Brick</th>
            {build.colorIds.map((id) => {
              const color = colorById(id);
              return (
                <th key={id} scope="col" title={color.name}>
                  <span className="swatch swatch-small" style={{ backgroundColor: cssColor(color.rgb) }} />
                  <span className="visually-hidden">{color.name}</span>
                </th>
              );
            })}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {build.lengths.map((length) => (
            <tr key={length}>
              <th scope="row">1 × {length}</th>
              {build.colorIds.map((id) => (
                <td key={id}>{count(length, id) || ''}</td>
              ))}
              <td>{build.colorIds.reduce((sum, id) => sum + count(length, id), 0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            {build.colorIds.map((id) => (
              <td key={id}>{build.lengths.reduce((sum, length) => sum + count(length, id), 0)}</td>
            ))}
            <td>{build.total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

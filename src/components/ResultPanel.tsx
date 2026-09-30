import type { Mosaic } from '../core/mosaic';
import { downloadBlob, partsListCsv } from '../lib/partsList';
import { Section } from './Section';

interface Props {
  mosaic: Mosaic | null;
  getCanvas: () => HTMLCanvasElement | null;
}

export function ResultPanel({ mosaic, getCanvas }: Props) {
  const savePng = () => {
    getCanvas()?.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, 'mosaic.png');
      }
    }, 'image/png');
  };

  const saveParts = () => {
    if (mosaic) {
      downloadBlob(new Blob([partsListCsv(mosaic.build)], { type: 'text/csv' }), 'mosaic-parts.csv');
    }
  };

  return (
    <Section
      title="Result"
      footer={
        mosaic ? (
          <>
            Needs <strong>{mosaic.build.total.toLocaleString()}</strong> bricks in{' '}
            <strong>{mosaic.build.colorIds.length}</strong> colours
          </>
        ) : null
      }
    >
      <div className="button-row">
        <a className="button button-primary" href="#instructions" aria-disabled={!mosaic}>
          Build instructions
        </a>
        <button type="button" className="button" disabled={!mosaic} onClick={savePng}>
          Save image
        </button>
        <button type="button" className="button" disabled={!mosaic} onClick={saveParts}>
          Parts list (CSV)
        </button>
      </div>
    </Section>
  );
}

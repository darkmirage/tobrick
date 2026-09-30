import { useEffect, useState, type DragEvent, type RefObject } from 'react';
import type { Mosaic } from '../core/mosaic';
import { drawMosaic } from '../lib/drawMosaic';

interface Props {
  mosaic: Mosaic | null;
  originalUrl: string | null;
  busy: boolean;
  error: string | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onDropFile: (file: File) => void;
}

export function MosaicPreview({ mosaic, originalUrl, busy, error, canvasRef, onDropFile }: Props) {
  const [comparing, setComparing] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (mosaic && canvasRef.current) {
      drawMosaic(canvasRef.current, mosaic);
    }
  }, [mosaic, canvasRef]);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = [...event.dataTransfer.files].find((f) => f.type.startsWith('image/'));
    if (file) {
      onDropFile(file);
    }
  };

  const showOriginal = () => {
    setComparing(true);
  };
  const hideOriginal = () => {
    setComparing(false);
  };

  return (
    <div
      className="preview"
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => {
        setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div
        className="preview-frame"
        data-busy={busy || undefined}
        onPointerDown={showOriginal}
        onPointerUp={hideOriginal}
        onPointerLeave={hideOriginal}
        onPointerCancel={hideOriginal}
      >
        <canvas ref={canvasRef} className="preview-canvas" hidden={!mosaic} />
        {originalUrl && mosaic ? (
          <img src={originalUrl} alt="" className="preview-original" hidden={!comparing} draggable={false} />
        ) : null}
        {!mosaic && !error ? <div className="preview-placeholder">Generating…</div> : null}
      </div>
      {error ? <p className="preview-error" role="alert">{error}</p> : null}
      {mosaic ? <p className="hint">Press and hold the mosaic to compare with the original.</p> : null}
    </div>
  );
}

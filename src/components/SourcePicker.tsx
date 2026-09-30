import type { ChangeEvent } from 'react';
import type { Sample } from '../samples';
import { Section } from './Section';

interface Props {
  samples: readonly Sample[];
  currentUrl: string | null;
  onSample: (sample: Sample) => void;
  onFile: (file: File) => void;
}

export function SourcePicker({ samples, currentUrl, onSample, onFile }: Props) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
    event.target.value = '';
  };

  return (
    <Section title="Source image">
      <div className="thumbnails">
        {samples.map((sample) => (
          <button
            key={sample.url}
            type="button"
            className="thumbnail"
            aria-pressed={sample.url === currentUrl}
            title={sample.title}
            style={{ backgroundImage: `url(${sample.url})` }}
            onClick={() => {
              onSample(sample);
            }}
          >
            <span className="visually-hidden">{sample.title}</span>
          </button>
        ))}
        <label className="thumbnail thumbnail-upload" title="Upload your own image">
          Upload
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      </div>
      <p className="hint">Or drop an image onto the preview.</p>
    </Section>
  );
}

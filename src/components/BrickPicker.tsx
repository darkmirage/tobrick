import { ALL_BRICK_LENGTHS } from '../core/bricks';
import { Section } from './Section';

interface Props {
  selected: readonly number[];
  onChange: (lengths: number[]) => void;
}

export function BrickPicker({ selected, onChange }: Props) {
  const toggle = (length: number) => {
    onChange(
      selected.includes(length) ? selected.filter((l) => l !== length) : [...selected, length],
    );
  };

  return (
    <Section title="Bricks">
      <div className="chips">
        {ALL_BRICK_LENGTHS.map((length) =>
          length === 1 ? (
            <button key={length} type="button" className="chip" aria-pressed disabled title="1 x 1 bricks are always used">
              1 × 1
            </button>
          ) : (
            <button
              key={length}
              type="button"
              className="chip"
              aria-pressed={selected.includes(length)}
              onClick={() => {
                toggle(length);
              }}
            >
              1 × {length}
            </button>
          ),
        )}
      </div>
    </Section>
  );
}

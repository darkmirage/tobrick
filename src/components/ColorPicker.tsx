import { cssColor, DEFAULT_COLOR_IDS, SELECTABLE_COLORS } from '../core/palette';
import { Section } from './Section';

interface Props {
  selected: readonly number[];
  onChange: (colorIds: number[]) => void;
}

export function ColorPicker({ selected, onChange }: Props) {
  const toggle = (id: number) => {
    if (!selected.includes(id)) {
      onChange([...selected, id]);
    } else if (selected.length > 1) {
      onChange(selected.filter((c) => c !== id));
    }
  };

  return (
    <Section
      title="Colours"
      footer={
        <div className="panel-actions">
          <span>
            <strong>{selected.length}</strong> selected
          </span>
          <button type="button" className="link-button" onClick={() => { onChange([...DEFAULT_COLOR_IDS]); }}>
            Reset to defaults
          </button>
        </div>
      }
    >
      <div className="swatches">
        {SELECTABLE_COLORS.map((color) => {
          const isSelected = selected.includes(color.id);
          return (
            <button
              key={color.id}
              type="button"
              className="swatch"
              aria-pressed={isSelected}
              title={color.name}
              aria-label={color.name}
              disabled={isSelected && selected.length === 1}
              style={{ backgroundColor: cssColor(color.rgb) }}
              onClick={() => {
                toggle(color.id);
              }}
            />
          );
        })}
      </div>
    </Section>
  );
}

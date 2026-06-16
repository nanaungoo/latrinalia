import { useState } from 'react';

const FONT_NAMES = {
  marker: 'Marker',
  scratched: 'Scratched',
  cursive: 'Cursive',
  stencil: 'Stencil',
};

export default function StickerForm({ fonts, colors, onSubmit }) {
  const [text, setText] = useState('');
  const [font, setFont] = useState('marker');
  const [color, setColor] = useState('#000000');
  const [collapsed, setCollapsed] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({
      text_content: text.trim(),
      font_style: font,
      color,
    });
    setText('');
    setCollapsed(true);
  };

  if (collapsed) {
    return (
      <button className="scribble-btn" onClick={() => setCollapsed(false)}>
        ✏️ Scribble something...
      </button>
    );
  }

  return (
    <form className="sticker-form" onSubmit={handleSubmit}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your graffiti..."
        rows={3}
        maxLength={500}
      />
      <div className="form-controls">
        <div className="font-picker">
          {Object.entries(FONT_NAMES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`font-option ${font === key ? 'active' : ''}`}
              style={{ fontFamily: fonts[key] }}
              onClick={() => setFont(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="color-picker">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={!text.trim()}>
          Stick it! 📌
        </button>
        <button type="button" className="cancel-btn" onClick={() => setCollapsed(true)}>
          Nah
        </button>
      </div>
    </form>
  );
}

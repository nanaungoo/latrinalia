import { useState } from 'react';

const FONT_NAMES = {
  marker: 'Marker',
  scratched: 'Scratched',
  cursive: 'Cursive',
  stencil: 'Stencil',
  myanmar: 'Myanmar',
};

const EMOJI_LIST = [
  '😀', '😂', '🤣', '😎', '🤔', '😴', '🤢', '💀',
  '👻', '🤡', '💩', '👽', '🤖', '🎃', '🔥', '❤️',
  '👍', '👎', '🙏', '💪', '🫡', '🤙', '✌️', '🫶',
  '🚽', '💩', '🧻', '🪠', '🚿', '🧼', '🪥', '🪒',
  '⭐', '🌈', '🎵', '🎮', '📱', '💻', '🚗', '✈️',
  '🎉', '🎊', '🎂', '🍕', '🍔', '🍺', '☕', '🧋',
];

export default function StickerForm({ fonts, colors, onSubmit }) {
  const [text, setText] = useState('');
  const [font, setFont] = useState('marker');
  const [color, setColor] = useState('#000000');
  const [collapsed, setCollapsed] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);

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
    setShowEmojis(false);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
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

      {showEmojis && (
        <div className="emoji-picker">
          {EMOJI_LIST.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className="emoji-btn"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="form-controls">
        <button
          type="button"
          className={`emoji-toggle ${showEmojis ? 'active' : ''}`}
          onClick={() => setShowEmojis(!showEmojis)}
        >
          😀
        </button>
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

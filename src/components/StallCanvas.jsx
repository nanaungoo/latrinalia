import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStickers, addSticker, deleteSticker, runJanitor, trackEvent } from '../lib/api';
import StickerForm from './StickerForm';
import DraggableSticker from './DraggableSticker';

export default function StallCanvas({ toilet, fonts, colors, onLeave }) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJanitor, setShowJanitor] = useState(false);
  // Store delete tokens (keyed by sticker id) — only tokens from this session
  const deleteTokensRef = useRef({});

  const loadStickers = useCallback(() => {
    setLoading(true);
    fetchStickers(toilet.id)
      .then(setStickers)
      .finally(() => setLoading(false));
  }, [toilet.id]);

  useEffect(() => {
    loadStickers();
    const interval = setInterval(loadStickers, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [loadStickers]);

  const handleAdd = async (data) => {
    const result = await addSticker(toilet.id, data);
    // Store the delete token so the creator can delete this sticker
    if (result.delete_token) {
      deleteTokensRef.current[result.id] = result.delete_token;
    }
    setStickers((prev) => [...prev, result]);
    trackEvent('sticker_created', {
      stall_id: toilet.id,
      font_style: data.font_style,
      has_emoji: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(data.text_content),
    });
  };

  const handleDelete = async (id) => {
    const token = deleteTokensRef.current[id];
    if (!token) {
      alert('You can only delete stickers you created in this session.');
      return;
    }
    await deleteSticker(id, token);
    delete deleteTokensRef.current[id];
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleJanitor = async () => {
    const result = await runJanitor(toilet.id);
    alert(result.message);
    loadStickers();
    setShowJanitor(false);
  };

  return (
    <div className="stall">
      <div className="stall-header">
        <button className="back-btn" onClick={onLeave}>
          ← Lobby
        </button>
        <h2>{toilet.name}</h2>
        <button className="janitor-btn" onClick={() => setShowJanitor(!showJanitor)} title="Janitor mode">
          🧹
        </button>
      </div>

      {showJanitor && (
        <div className="janitor-panel">
          <p>Janitor Mode: remove stickers older than 7 days?</p>
          <button onClick={handleJanitor}>Sweep 🧹</button>
          <button onClick={() => setShowJanitor(false)}>Cancel</button>
        </div>
      )}

      <div className="stall-wall">
        {loading && stickers.length === 0 && (
          <div className="loading">Loading the wall...</div>
        )}

        {!loading && stickers.length === 0 && (
          <div className="empty-wall">
            <p>This wall is clean. Be the first.</p>
          </div>
        )}

        {stickers.map((s) => (
          <DraggableSticker
            key={s.id}
            sticker={s}
            fonts={fonts}
            canDelete={!!deleteTokensRef.current[s.id]}
            onDelete={() => handleDelete(s.id)}
          />
        ))}
      </div>

      <StickerForm fonts={fonts} colors={colors} onSubmit={handleAdd} />
    </div>
  );
}

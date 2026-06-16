import { useState, useEffect, useCallback } from 'react';
import { fetchStickers, addSticker, deleteSticker, runJanitor } from '../lib/api';
import StickerForm from './StickerForm';
import DraggableSticker from './DraggableSticker';

export default function StallCanvas({ toilet, fonts, colors, onLeave }) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJanitor, setShowJanitor] = useState(false);

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
    const sticker = await addSticker(toilet.id, data);
    setStickers((prev) => [...prev, sticker]);
  };

  const handleDelete = async (id) => {
    await deleteSticker(id);
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
            onDelete={() => handleDelete(s.id)}
          />
        ))}
      </div>

      <StickerForm fonts={fonts} colors={colors} onSubmit={handleAdd} />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

export default function DraggableSticker({ sticker, fonts, canDelete, onDelete }) {
  const [pos, setPos] = useState({
    x: sticker.x_position,
    y: sticker.y_position,
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const stickerRef = useRef(null);

  useEffect(() => {
    const handlePointerMoveGlobal = (e) => {
      if (!dragging) return;
      const dx = ((e.clientX - dragRef.current.startX) / window.innerWidth) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / window.innerHeight) * 100;
      setPos({
        x: Math.max(0, Math.min(95, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(95, dragRef.current.origY + dy)),
      });
    };

    const handlePointerUpGlobal = () => {
      setDragging(false);
    };

    if (dragging) {
      window.addEventListener('pointermove', handlePointerMoveGlobal);
      window.addEventListener('pointerup', handlePointerUpGlobal);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMoveGlobal);
      window.removeEventListener('pointerup', handlePointerUpGlobal);
    };
  }, [dragging]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    // Capture pointer for reliable tracking
    if (stickerRef.current) {
      stickerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Rip this sticker off the wall?')) {
      onDelete();
    }
  };

  const fontFamily = fonts[sticker.font_style] || fonts.marker;

  return (
    <div
      ref={stickerRef}
      className={`sticker ${dragging ? 'dragging' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `rotate(${sticker.angle}deg)`,
        fontFamily,
        color: sticker.color,
      }}
      onPointerDown={handlePointerDown}
    >
      {canDelete && (
        <button className="sticker-delete" onClick={handleDelete} title="Remove">
          ×
        </button>
      )}
      <span className="sticker-text">{sticker.text_content}</span>
      <span className="sticker-time">
        {new Date(sticker.created_at).toLocaleDateString()}
      </span>
    </div>
  );
}

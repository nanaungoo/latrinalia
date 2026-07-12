import { useState, useEffect } from 'react';

const STORAGE_KEY = 'latrinalia_welcome_seen';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="welcome-overlay" onClick={handleClose}>
      <div className="welcome-popup" onClick={(e) => e.stopPropagation()}>
        <h2>🚽 Welcome to Latrinalia!</h2>
        <p className="welcome-subtitle">Digital Toilet Graffiti Wall</p>

        <div className="welcome-instructions">
          <div className="instruction-step">
            <span className="step-icon">🚪</span>
            <span className="step-text">Pick a stall from the lobby</span>
          </div>
          <div className="instruction-step">
            <span className="step-icon">✏️</span>
            <span className="step-text">Tap "Scribble something" to write</span>
          </div>
          <div className="instruction-step">
            <span className="step-icon">😀</span>
            <span className="step-text">Use the 😀 button to add emojis</span>
          </div>
          <div className="instruction-step">
            <span className="step-icon">🇲🇲</span>
            <span className="step-text">Choose Myanmar font for မြန်မာစာ</span>
          </div>
          <div className="instruction-step">
            <span className="step-icon">👆</span>
            <span className="step-text">Drag stickers to move them around</span>
          </div>
        </div>

        <button className="welcome-btn" onClick={handleClose}>
          Got it! Let's scribble 📌
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { fetchToilets } from './lib/api';
import StallCanvas from './components/StallCanvas';

const FONTS = {
  marker: "'Permanent Marker', cursive",
  scratched: "'Nothing You Could Do', cursive",
  cursive: "'Caveat Brush', cursive",
  stencil: "'Special Elite', monospace",
};

const COLORS = ['#000000', '#cc0000', '#0066cc', '#339933', '#ff6600', '#993399', '#ff00ff', '#666666'];

export default function App() {
  const [toilets, setToilets] = useState([]);
  const [activeToilet, setActiveToilet] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchToilets()
      .then(setToilets)
      .catch(() => setError('Could not reach the server. Is it running?'));
  }, []);

  if (error) {
    return (
      <div className="app-error">
        <h1>🚽</h1>
        <p>{error}</p>
        <code>npm run dev</code>
      </div>
    );
  }

  return (
    <div className="app">
      {!activeToilet ? (
        <div className="lobby">
          <h1>🚽 Latrinalia</h1>
          <p className="tagline">Every stall has a story. Choose one.</p>
          <div className="toilet-list">
            {toilets.map((t) => (
              <button key={t.id} className="toilet-card" onClick={() => setActiveToilet(t)}>
                <span className="toilet-icon">🚪</span>
                <span className="toilet-name">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <StallCanvas
          toilet={activeToilet}
          fonts={FONTS}
          colors={COLORS}
          onLeave={() => setActiveToilet(null)}
        />
      )}
    </div>
  );
}

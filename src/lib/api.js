// In development, use Vite proxy (/api → localhost:8787)
// In production, use the Cloudflare Worker URL
const API_BASE = import.meta.env.DEV ? '/api' : 'https://latrinalia.nannaungoo.workers.dev/api';

export async function fetchToilets() {
  const res = await fetch(`${API_BASE}/toilets`);
  if (!res.ok) throw new Error('Failed to fetch toilets');
  return res.json();
}

export async function fetchStickers(toiletId) {
  const res = await fetch(`${API_BASE}/toilets/${toiletId}/stickers`);
  if (!res.ok) throw new Error('Failed to fetch stickers');
  return res.json();
}

export async function addSticker(toiletId, sticker) {
  const res = await fetch(`${API_BASE}/toilets/${toiletId}/stickers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sticker),
  });
  if (!res.ok) throw new Error('Failed to add sticker');
  return res.json();
}

export async function deleteSticker(id, deleteToken) {
  const res = await fetch(`${API_BASE}/stickers/${id}?delete_token=${encodeURIComponent(deleteToken)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete sticker');
  return res.json();
}

export async function runJanitor(toiletId, days = 7) {
  const res = await fetch(`${API_BASE}/toilets/${toiletId}/janitor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });
  if (!res.ok) throw new Error('Failed to run janitor');
  return res.json();
}

export async function trackEvent(eventType, eventData = null) {
  try {
    await fetch(`${API_BASE}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, event_data: eventData }),
    });
  } catch {
    // Silently fail — analytics shouldn't break the app
  }
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

const API_BASE = '/api';

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

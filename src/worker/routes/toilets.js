const jsonHeaders = { 'Content-Type': 'application/json' };

export async function handleToilets(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // GET /api/toilets — list all toilets
  if (path === '/api/toilets' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM toilets ORDER BY created_at'
    ).all();
    return Response.json(results);
  }

  // GET /api/toilets/:toiletId/stickers — get stickers for a toilet
  const stickersMatch = path.match(/^\/api\/toilets\/([^/]+)\/stickers$/);
  if (stickersMatch && request.method === 'GET') {
    const toiletId = stickersMatch[1];
    const { results } = await env.DB.prepare(
      'SELECT id, toilet_id, text_content, font_style, color, x_position, y_position, angle, created_at FROM stickers WHERE toilet_id = ? ORDER BY created_at'
    )
      .bind(toiletId)
      .all();
    return Response.json(results);
  }

  // POST /api/toilets/:toiletId/stickers — add a sticker
  if (stickersMatch && request.method === 'POST') {
    const toiletId = stickersMatch[1];
    return addSticker(request, env, toiletId);
  }

  return new Response('Not Found', { status: 404 });
}

// Validation helpers
const VALID_FONTS = ['marker', 'scratched', 'cursive', 'stencil', 'myanmar'];
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
const MAX_TEXT_LENGTH = 500;

function validateStickerInput({ text_content, font_style, color, x_position, y_position, angle }) {
  if (!text_content || typeof text_content !== 'string' || text_content.trim().length === 0) {
    return 'text_content is required';
  }
  if (text_content.length > MAX_TEXT_LENGTH) {
    return `text_content must be ${MAX_TEXT_LENGTH} characters or fewer`;
  }
  if (font_style && !VALID_FONTS.includes(font_style)) {
    return `font_style must be one of: ${VALID_FONTS.join(', ')}`;
  }
  if (color && !HEX_COLOR_RE.test(color)) {
    return 'color must be a valid hex color (e.g. #ff0000)';
  }
  if (x_position !== undefined && (typeof x_position !== 'number' || x_position < 0 || x_position > 100)) {
    return 'x_position must be a number between 0 and 100';
  }
  if (y_position !== undefined && (typeof y_position !== 'number' || y_position < 0 || y_position > 100)) {
    return 'y_position must be a number between 0 and 100';
  }
  if (angle !== undefined && (typeof angle !== 'number' || angle < -180 || angle > 180)) {
    return 'angle must be a number between -180 and 180';
  }
  return null;
}

async function addSticker(request, env, toiletId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const { text_content, font_style, color, x_position, y_position, angle } = body;

  const validationError = validateStickerInput({ text_content, font_style, color, x_position, y_position, angle });
  if (validationError) {
    return new Response(
      JSON.stringify({ error: validationError }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const id = crypto.randomUUID();
  const delete_token = crypto.randomUUID();
  const now = new Date().toISOString();

  const sticker = {
    id,
    toilet_id: toiletId,
    text_content: text_content.trim(),
    font_style: font_style || 'marker',
    color: color || '#000000',
    x_position: x_position ?? Math.floor(Math.random() * 80) + 10,
    y_position: y_position ?? Math.floor(Math.random() * 80) + 10,
    angle: angle ?? Math.floor(Math.random() * 60) - 30,
    delete_token,
    created_at: now,
  };

  await env.DB.prepare(
    'INSERT INTO stickers (id, toilet_id, text_content, font_style, color, x_position, y_position, angle, delete_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      sticker.id,
      sticker.toilet_id,
      sticker.text_content,
      sticker.font_style,
      sticker.color,
      sticker.x_position,
      sticker.y_position,
      sticker.angle,
      sticker.delete_token,
      sticker.created_at
    )
    .run();

  return Response.json(sticker, { status: 201 });
}

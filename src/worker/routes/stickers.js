const jsonHeaders = { 'Content-Type': 'application/json' };

export async function handleStickers(request, env, action) {
  const url = new URL(request.url);

  // DELETE /api/stickers/:id — delete a sticker
  if (action === 'delete' && request.method === 'DELETE') {
    const idMatch = url.pathname.match(/^\/api\/stickers\/([^/]+)$/);
    if (!idMatch) {
      return new Response('Invalid sticker ID', { status: 400, headers: jsonHeaders });
    }

    const stickerId = idMatch[1];
    const deleteToken = url.searchParams.get('delete_token');

    if (!deleteToken) {
      return new Response(
        JSON.stringify({ error: 'delete_token is required to remove a sticker' }),
        { status: 403, headers: jsonHeaders }
      );
    }

    // Get the sticker
    const sticker = await env.DB.prepare('SELECT * FROM stickers WHERE id = ?')
      .bind(stickerId)
      .first();

    if (!sticker) {
      return new Response(
        JSON.stringify({ error: 'Sticker not found' }),
        { status: 404, headers: jsonHeaders }
      );
    }

    // Verify delete token
    if (sticker.delete_token !== deleteToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid delete_token' }),
        { status: 403, headers: jsonHeaders }
      );
    }

    await env.DB.prepare('DELETE FROM stickers WHERE id = ?').bind(stickerId).run();

    return Response.json({ deleted: true });
  }

  // POST /api/toilets/:toiletId/janitor — clean old stickers
  if (action === 'janitor' && request.method === 'POST') {
    const janitorMatch = url.pathname.match(/^\/api\/toilets\/([^/]+)\/janitor$/);
    if (!janitorMatch) {
      return new Response('Invalid toilet ID', { status: 400, headers: jsonHeaders });
    }

    const toiletId = janitorMatch[1];
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const days = Math.max(1, Math.min(365, Number(body.days) || 7));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Count stickers to remove
    const { results } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM stickers WHERE toilet_id = ? AND created_at < ?'
    )
      .bind(toiletId, cutoff)
      .all();

    const count = results[0]?.count || 0;

    if (count === 0) {
      return Response.json({ removed: 0, message: 'Wall is clean — nothing to remove.' });
    }

    await env.DB.prepare('DELETE FROM stickers WHERE toilet_id = ? AND created_at < ?')
      .bind(toiletId, cutoff)
      .run();

    return Response.json({
      removed: count,
      toilet_id: toiletId,
      cutoff,
      message: `Janitor swept ${count} sticker(s) from ${toiletId}.`,
    });
  }

  return new Response('Not Found', { status: 404 });
}

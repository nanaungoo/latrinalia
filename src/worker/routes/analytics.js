const jsonHeaders = { 'Content-Type': 'application/json' };

export async function handleAnalytics(request, env) {
  // POST /api/analytics — track an event
  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const { event_type, event_data } = body;

    if (!event_type || typeof event_type !== 'string') {
      return new Response(
        JSON.stringify({ error: 'event_type is required' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    await env.DB.prepare('INSERT INTO analytics (event_type, event_data) VALUES (?, ?)')
      .bind(event_type, event_data ? JSON.stringify(event_data) : null)
      .run();

    return Response.json({ tracked: true }, { status: 201 });
  }

  // GET /api/analytics — get analytics summary
  if (request.method === 'GET') {
    const totalStickers = await env.DB.prepare('SELECT COUNT(*) as count FROM stickers')
      .first();
    const totalToilets = await env.DB.prepare('SELECT COUNT(*) as count FROM toilets')
      .first();
    const stickersPerToilet = await env.DB.prepare(
      'SELECT toilet_id, COUNT(*) as count FROM stickers GROUP BY toilet_id'
    ).all();
    const recentStickers = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM stickers WHERE created_at > datetime("now", "-7 days")'
    ).first();
    const totalEvents = await env.DB.prepare('SELECT COUNT(*) as count FROM analytics')
      .first();

    return Response.json({
      totalStickers: totalStickers?.count || 0,
      totalToilets: totalToilets?.count || 0,
      stickersPerToilet: stickersPerToilet?.results || [],
      recentStickers: recentStickers?.count || 0,
      totalEvents: totalEvents?.count || 0,
    });
  }

  return new Response('Method not allowed', { status: 405 });
}

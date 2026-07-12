// D1-backed rate limiting middleware
// Fixed window: 60 requests per minute per IP

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function checkRateLimit(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  try {
    // Clean up old entries and get current count
    await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?')
      .bind(windowStart)
      .run();

    const { results } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND window_start > ?'
    )
      .bind(ip, windowStart)
      .all();

    const currentCount = results[0]?.count || 0;

    if (currentCount >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Record this request
    await env.DB.prepare('INSERT INTO rate_limits (ip, window_start) VALUES (?, ?)')
      .bind(ip, now)
      .run();

    // Allow the request to proceed
    return null;
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error('Rate limit error:', error);
    return null;
  }
}

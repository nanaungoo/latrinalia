import { handleToilets } from './routes/toilets.js';
import { handleStickers } from './routes/stickers.js';
import { handleAnalytics } from './routes/analytics.js';
import { checkRateLimit } from './middleware/rateLimit.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Delete-Token',
  'Access-Control-Max-Age': '86400',
};

function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Rate limiting (60 requests per minute per IP)
    const rateLimitResponse = await checkRateLimit(request, env);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    try {
      let response;

      // Route to appropriate handler
      if (path === '/api/toilets' || path.match(/^\/api\/toilets\/[^/]+\/stickers$/)) {
        response = await handleToilets(request, env);
      } else if (path.match(/^\/api\/toilets\/[^/]+\/janitor$/)) {
        response = await handleStickers(request, env, 'janitor');
      } else if (path.match(/^\/api\/stickers\/[^/]+$/)) {
        response = await handleStickers(request, env, 'delete');
      } else if (path === '/api/analytics') {
        response = await handleAnalytics(request, env);
      } else {
        // Serve static assets from dist/ for non-API routes
        return env.ASSETS.fetch(request);
      }

      // Add CORS headers to response
      const newResponse = new Response(response.body, response);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newResponse.headers.set(key, value);
      }
      return newResponse;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};

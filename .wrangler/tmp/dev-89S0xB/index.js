var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-ZRHlpB/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker/routes/toilets.js
var jsonHeaders = { "Content-Type": "application/json" };
async function handleToilets(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/api/toilets" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM toilets ORDER BY created_at"
    ).all();
    return Response.json(results);
  }
  const stickersMatch = path.match(/^\/api\/toilets\/([^/]+)\/stickers$/);
  if (stickersMatch && request.method === "GET") {
    const toiletId = stickersMatch[1];
    const { results } = await env.DB.prepare(
      "SELECT id, toilet_id, text_content, font_style, color, x_position, y_position, angle, created_at FROM stickers WHERE toilet_id = ? ORDER BY created_at"
    ).bind(toiletId).all();
    return Response.json(results);
  }
  if (stickersMatch && request.method === "POST") {
    const toiletId = stickersMatch[1];
    return addSticker(request, env, toiletId);
  }
  return new Response("Not Found", { status: 404 });
}
__name(handleToilets, "handleToilets");
var VALID_FONTS = ["marker", "scratched", "cursive", "stencil", "myanmar"];
var HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
var MAX_TEXT_LENGTH = 500;
function validateStickerInput({ text_content, font_style, color, x_position, y_position, angle }) {
  if (!text_content || typeof text_content !== "string" || text_content.trim().length === 0) {
    return "text_content is required";
  }
  if (text_content.length > MAX_TEXT_LENGTH) {
    return `text_content must be ${MAX_TEXT_LENGTH} characters or fewer`;
  }
  if (font_style && !VALID_FONTS.includes(font_style)) {
    return `font_style must be one of: ${VALID_FONTS.join(", ")}`;
  }
  if (color && !HEX_COLOR_RE.test(color)) {
    return "color must be a valid hex color (e.g. #ff0000)";
  }
  if (x_position !== void 0 && (typeof x_position !== "number" || x_position < 0 || x_position > 100)) {
    return "x_position must be a number between 0 and 100";
  }
  if (y_position !== void 0 && (typeof y_position !== "number" || y_position < 0 || y_position > 100)) {
    return "y_position must be a number between 0 and 100";
  }
  if (angle !== void 0 && (typeof angle !== "number" || angle < -180 || angle > 180)) {
    return "angle must be a number between -180 and 180";
  }
  return null;
}
__name(validateStickerInput, "validateStickerInput");
async function addSticker(request, env, toiletId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
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
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sticker = {
    id,
    toilet_id: toiletId,
    text_content: text_content.trim(),
    font_style: font_style || "marker",
    color: color || "#000000",
    x_position: x_position ?? Math.floor(Math.random() * 80) + 10,
    y_position: y_position ?? Math.floor(Math.random() * 80) + 10,
    angle: angle ?? Math.floor(Math.random() * 60) - 30,
    delete_token,
    created_at: now
  };
  await env.DB.prepare(
    "INSERT INTO stickers (id, toilet_id, text_content, font_style, color, x_position, y_position, angle, delete_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
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
  ).run();
  return Response.json(sticker, { status: 201 });
}
__name(addSticker, "addSticker");

// src/worker/routes/stickers.js
var jsonHeaders2 = { "Content-Type": "application/json" };
async function handleStickers(request, env, action) {
  const url = new URL(request.url);
  if (action === "delete" && request.method === "DELETE") {
    const idMatch = url.pathname.match(/^\/api\/stickers\/([^/]+)$/);
    if (!idMatch) {
      return new Response("Invalid sticker ID", { status: 400, headers: jsonHeaders2 });
    }
    const stickerId = idMatch[1];
    const deleteToken = url.searchParams.get("delete_token");
    if (!deleteToken) {
      return new Response(
        JSON.stringify({ error: "delete_token is required to remove a sticker" }),
        { status: 403, headers: jsonHeaders2 }
      );
    }
    const sticker = await env.DB.prepare("SELECT * FROM stickers WHERE id = ?").bind(stickerId).first();
    if (!sticker) {
      return new Response(
        JSON.stringify({ error: "Sticker not found" }),
        { status: 404, headers: jsonHeaders2 }
      );
    }
    if (sticker.delete_token !== deleteToken) {
      return new Response(
        JSON.stringify({ error: "Invalid delete_token" }),
        { status: 403, headers: jsonHeaders2 }
      );
    }
    await env.DB.prepare("DELETE FROM stickers WHERE id = ?").bind(stickerId).run();
    return Response.json({ deleted: true });
  }
  if (action === "janitor" && request.method === "POST") {
    const janitorMatch = url.pathname.match(/^\/api\/toilets\/([^/]+)\/janitor$/);
    if (!janitorMatch) {
      return new Response("Invalid toilet ID", { status: 400, headers: jsonHeaders2 });
    }
    const toiletId = janitorMatch[1];
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const days = Math.max(1, Math.min(365, Number(body.days) || 7));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1e3).toISOString();
    const { results } = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM stickers WHERE toilet_id = ? AND created_at < ?"
    ).bind(toiletId, cutoff).all();
    const count = results[0]?.count || 0;
    if (count === 0) {
      return Response.json({ removed: 0, message: "Wall is clean \u2014 nothing to remove." });
    }
    await env.DB.prepare("DELETE FROM stickers WHERE toilet_id = ? AND created_at < ?").bind(toiletId, cutoff).run();
    return Response.json({
      removed: count,
      toilet_id: toiletId,
      cutoff,
      message: `Janitor swept ${count} sticker(s) from ${toiletId}.`
    });
  }
  return new Response("Not Found", { status: 404 });
}
__name(handleStickers, "handleStickers");

// src/worker/routes/analytics.js
var jsonHeaders3 = { "Content-Type": "application/json" };
async function handleAnalytics(request, env) {
  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: jsonHeaders3 }
      );
    }
    const { event_type, event_data } = body;
    if (!event_type || typeof event_type !== "string") {
      return new Response(
        JSON.stringify({ error: "event_type is required" }),
        { status: 400, headers: jsonHeaders3 }
      );
    }
    await env.DB.prepare("INSERT INTO analytics (event_type, event_data) VALUES (?, ?)").bind(event_type, event_data ? JSON.stringify(event_data) : null).run();
    return Response.json({ tracked: true }, { status: 201 });
  }
  if (request.method === "GET") {
    const totalStickers = await env.DB.prepare("SELECT COUNT(*) as count FROM stickers").first();
    const totalToilets = await env.DB.prepare("SELECT COUNT(*) as count FROM toilets").first();
    const stickersPerToilet = await env.DB.prepare(
      "SELECT toilet_id, COUNT(*) as count FROM stickers GROUP BY toilet_id"
    ).all();
    const recentStickers = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM stickers WHERE created_at > datetime("now", "-7 days")'
    ).first();
    const totalEvents = await env.DB.prepare("SELECT COUNT(*) as count FROM analytics").first();
    return Response.json({
      totalStickers: totalStickers?.count || 0,
      totalToilets: totalToilets?.count || 0,
      stickersPerToilet: stickersPerToilet?.results || [],
      recentStickers: recentStickers?.count || 0,
      totalEvents: totalEvents?.count || 0
    });
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(handleAnalytics, "handleAnalytics");

// src/worker/middleware/rateLimit.js
var RATE_LIMIT_MAX = 60;
var RATE_LIMIT_WINDOW_MS = 60 * 1e3;
async function checkRateLimit(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  try {
    await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(windowStart).run();
    const { results } = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND window_start > ?"
    ).bind(ip, windowStart).all();
    const currentCount = results[0]?.count || 0;
    if (currentCount >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
            "X-RateLimit-Remaining": "0"
          }
        }
      );
    }
    await env.DB.prepare("INSERT INTO rate_limits (ip, window_start) VALUES (?, ?)").bind(ip, now).run();
    return null;
  } catch (error) {
    console.error("Rate limit error:", error);
    return null;
  }
}
__name(checkRateLimit, "checkRateLimit");

// src/worker/index.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Delete-Token",
  "Access-Control-Max-Age": "86400"
};
function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}
__name(handleOptions, "handleOptions");
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return handleOptions();
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const rateLimitResponse = await checkRateLimit(request, env);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    try {
      let response;
      if (path === "/api/toilets" || path.match(/^\/api\/toilets\/[^/]+\/stickers$/)) {
        response = await handleToilets(request, env);
      } else if (path.match(/^\/api\/toilets\/[^/]+\/janitor$/)) {
        response = await handleStickers(request, env, "janitor");
      } else if (path.match(/^\/api\/stickers\/[^/]+$/)) {
        response = await handleStickers(request, env, "delete");
      } else if (path === "/api/analytics") {
        response = await handleAnalytics(request, env);
      } else {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }
      const newResponse = new Response(response.body, response);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newResponse.headers.set(key, value);
      }
      return newResponse;
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ZRHlpB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ZRHlpB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

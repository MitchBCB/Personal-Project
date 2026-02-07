const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  ...CORS_HEADERS,
};

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...JSON_HEADERS, ...(init.headers || {}) },
  });
}

function textResponse(message, status = 400) {
  return jsonResponse({ ok: false, message }, { status });
}

function parseJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return request.json();
}

function clampLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return 20;
  return Math.min(parsed, 100);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/health") {
      return jsonResponse({ ok: true, service: "typing-test-api" });
    }

    if (request.method === "GET" && path === "/text") {
      const { results } = await env.DB.prepare(
        "SELECT id, content FROM texts ORDER BY RANDOM() LIMIT 1"
      ).all();

      if (!results || results.length === 0) {
        return textResponse("No texts available. Seed the texts table.", 404);
      }

      return jsonResponse(results[0]);
    }

    if (request.method === "POST" && path === "/results") {
      const body = await parseJson(request);
      if (!body) {
        return textResponse("Expected application/json body.", 400);
      }

      const textId = body.textId;
      const usernameRaw = typeof body.username === "string" ? body.username.trim() : "";
      const username = usernameRaw.length > 0 ? usernameRaw : "Anonymous";
      const wpm = Number(body.wpm);
      const accuracy = Number(body.accuracy);
      const durationMs = Number(body.durationMs);

      if (!textId || typeof textId !== "string") {
        return textResponse("textId is required.", 400);
      }

      if (Number.isNaN(wpm) || wpm < 0 || wpm > 250) {
        return textResponse("wpm must be between 0 and 250.", 400);
      }

      if (Number.isNaN(accuracy) || accuracy < 0 || accuracy > 100) {
        return textResponse("accuracy must be between 0 and 100.", 400);
      }

      if (Number.isNaN(durationMs) || durationMs < 1000 || durationMs > 600000) {
        return textResponse("durationMs must be between 1000 and 600000.", 400);
      }

      const id = crypto.randomUUID();
      const createdAt = Date.now();

      await env.DB.prepare(
        "INSERT INTO results (id, text_id, username, wpm, accuracy, duration_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(id, textId, username, wpm, accuracy, durationMs, createdAt)
        .run();

      return jsonResponse({ ok: true, id }, { status: 201 });
    }

    if (request.method === "GET" && path === "/leaderboard") {
      const period = url.searchParams.get("period") || "all";
      const limit = clampLimit(url.searchParams.get("limit"));

      if (!['all', 'daily', 'weekly'].includes(period)) {
        return textResponse("period must be all, daily, or weekly.", 400);
      }

      let whereClause = "";
      let bindValues = [];

      if (period === "daily") {
        whereClause = "WHERE created_at >= ?";
        bindValues = [Date.now() - 24 * 60 * 60 * 1000];
      }

      if (period === "weekly") {
        whereClause = "WHERE created_at >= ?";
        bindValues = [Date.now() - 7 * 24 * 60 * 60 * 1000];
      }

      const query = `
        SELECT username, wpm, accuracy, duration_ms AS durationMs, created_at AS createdAt
        FROM results
        ${whereClause}
        ORDER BY wpm DESC, accuracy DESC, duration_ms ASC, created_at DESC
        LIMIT ?
      `;

      const { results } = await env.DB.prepare(query)
        .bind(...bindValues, limit)
        .all();

      return jsonResponse({
        period,
        limit,
        rows: results || [],
      });
    }

    return textResponse("Not found.", 404);
  },
};

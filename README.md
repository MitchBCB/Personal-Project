# Typing Test API (Cloudflare Workers)

This is a small Cloudflare Workers backend for the Typing Speed Test frontend. It serves random prompts, accepts results, and returns leaderboards.

## What this does (simple)
- **`GET /health`**: quick check that the API is live.
- **`GET /text`**: returns a random typing prompt from the `texts` table.
- **`POST /results`**: saves a user score into the `results` table.
- **`GET /leaderboard`**: returns the top scores (all-time / daily / weekly).

## Setup (needed for it to work)
1) **Create a D1 database** in your Cloudflare dashboard.
2) **Bind it as `DB`** (see `wrangler.jsonc`).
3) **Run the SQL below** in the D1 console to create tables + seed prompts.
4) **Deploy** (Cloudflare Builds will deploy on push).

## SQL schema + seed (run in D1 console)
```sql
CREATE TABLE IF NOT EXISTS texts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  text_id TEXT NOT NULL,
  username TEXT NOT NULL,
  wpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_results_created_at ON results (created_at);
CREATE INDEX IF NOT EXISTS idx_results_score ON results (wpm DESC, accuracy DESC, duration_ms ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_text_id ON results (text_id);

INSERT INTO texts (id, content) VALUES
  ('t1', 'The quick brown fox jumps over the lazy dog.'),
  ('t2', 'Typing fast is fun when accuracy stays high.'),
  ('t3', 'Cloudflare Workers make edge APIs simple and fast.'),
  ('t4', 'Practice daily to boost both speed and precision.'),
  ('t5', 'Short sentences can still be tricky to type.');
```

## Frontend call examples
```js
// GET /text
const textRes = await fetch("https://<worker-url>/text");
const prompt = await textRes.json();

// POST /results
await fetch("https://<worker-url>/results", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    textId: prompt.id,
    username: "Mitch",
    wpm: 72.5,
    accuracy: 97.3,
    durationMs: 30000
  })
});

// GET /leaderboard
const boardRes = await fetch("https://<worker-url>/leaderboard?period=all&limit=20");
const leaderboard = await boardRes.json();
```

## Leaderboard usage
Open these URLs in your browser to see JSON data:
- `/leaderboard?period=all&limit=20`
- `/leaderboard?period=daily&limit=20`
- `/leaderboard?period=weekly&limit=20`

## Notes
- If `/text` returns a 404, it means the `texts` table is empty. Seed it using the SQL above.
- Usernames are optional; blank usernames are stored as **Anonymous**.

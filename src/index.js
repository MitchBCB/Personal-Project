export default {
  async fetch(request) {
    return new Response(
      JSON.stringify({ ok: true, message: "Typing backend is live" }, null, 2),
      { headers: { "content-type": "application/json; charset=utf-8" } }
    );
  },
};

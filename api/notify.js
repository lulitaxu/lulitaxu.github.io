export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const data = req.body || {};
    const clean = (value, max = 300) =>
      String(value || "Unknown").replace(/[\r\n]/g, " ").slice(0, max);

    const message = [
      "👀 New Portfolio Visitor!",
      `City: ${clean(data.city, 100)}`,
      `Country: ${clean(data.country, 100)}`,
      `IP: ${clean(data.ip, 100)}`,
      `User agent: ${clean(data.userAgent)}`
    ].join("\n");

    const telegram = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message })
      }
    );

    if (!telegram.ok) {
      return res.status(502).json({ error: "Telegram request failed" });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Notification failed" });
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const city = decodeURIComponent(req.headers["x-vercel-ip-city"] || "Unknown City");
    const country = req.headers["x-vercel-ip-country"] || "Unknown Country";
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown IP";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    const message = [
      "👀 New Portfolio Visitor!",
      `City: ${city}`,
      `Country: ${country}`,
      `IP: ${ip}`,
      `User agent: ${userAgent}`
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
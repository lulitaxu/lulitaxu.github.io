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
    
    const city = decodeURIComponent(req.headers["x-vercel-ip-city"] || "Unknown");
    const country = req.headers["x-vercel-ip-country"] || "Unknown";
    const ip = req.headers["x-forwarded-for"]?.split(',')[0] || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    
    const rawReferrer = req.headers["referer"] || data.referrer || "Direct";
    let trafficSource = rawReferrer;
    if (rawReferrer.includes("instagram.com") || data.utmSource === "instagram") {
      trafficSource = "Instagram Bio";
    }

    const clean = (val, max = 250) => String(val || "Unknown").replace(/[\r\n]/g, " ").slice(0, max);

    const message = [
      "New Portfolio Visitor",
      `Location: ${city}, ${country}`,
      `IP: ${ip}`,
      `Source: ${clean(trafficSource, 150)}`,
      `Duration: ${clean(data.duration || "0 seconds")}`,
      `Screen: ${clean(data.screenSize)}`,
      `Theme: ${clean(data.theme)}`,
      `Battery: ${clean(data.battery)}`,
      `Network: ${clean(data.network)}`,
      `Hardware: ${clean(data.deviceMemory)}GB RAM, ${clean(data.hardwareConcurrency)} Cores`,
      `Timezone: ${clean(data.timezone)}`,
      `Fingerprint: ${clean(data.fingerprint)}`,
      `User Agent: ${clean(userAgent, 300)}`
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
  } catch (error) {
    return res.status(500).json({ error: "Notification failed" });
  }
}

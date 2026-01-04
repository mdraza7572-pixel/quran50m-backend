import { Analytics } from '@vercel/speed-insights/next';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const userMessage = req.body?.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Track API request with Speed Insights
    const startTime = Date.now();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Tum ek soft, polite aur respectful Islamic AI ho. Hinglish me short aur clear jawab do."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      }
    );

    const data = await response.json();
    const duration = Date.now() - startTime;

    // Record response metrics
    res.setHeader('Server-Timing', `total;dur=${duration}`);

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

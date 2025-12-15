require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("🔑 API KEY:", process.env.GEMINI_API_KEY ? "OK" : "TIDAK ADA");
console.log("🧠 BASE PROMPT:", process.env.BASE_PROMPT ? "OK" : "TIDAK ADA");

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong" });
  }

  try {
    console.log("📩 User:", userMessage);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${process.env.BASE_PROMPT}\n\nPertanyaan user:\n${userMessage}`,
              },
            ],
          },
        ],
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
        timeout: 20000,
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("⚠️ Reply kosong:", JSON.stringify(response.data, null, 2));
      return res.status(500).json({
        error: "AI tidak mengembalikan jawaban",
      });
    }

    console.log("🤖 AgungAI:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("🔥 ERROR GEMINI");

    if (error.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }

    res.status(500).json({
      error: "Maaf, AgungAI sedang sibuk atau limit gratis tercapai.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});

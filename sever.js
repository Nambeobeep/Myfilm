import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    }
  );

  const data = await response.json();
  const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn’t get that.";
  res.json({ reply: aiReply });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

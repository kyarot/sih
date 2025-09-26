// routes/translateRoutes.js
import express from "express";
import axios from "axios";

const trans = express.Router();

trans.post("/", async (req, res) => {
  try {
    const { text, target } = req.body;

    if (!text || !target) {
      return res.status(400).json({ error: "Text and target language required" });
    }

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`,
      { q: text, target }
    );

    const translated = response.data.data.translations[0].translatedText;
    res.json({ translated });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default trans;

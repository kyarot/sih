import axios from "axios";

export const transcribeAudio = async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: "No audio provided" });

    // Use WEBM_OPUS for Expo recordings
    const requestBody = {
      config: {
        encoding: "WEBM_OPUS",     // Works with Expo m4a/caf/webm
        sampleRateHertz: 48000,    // Expo default
        languageCode: "en-US",
      },
      audio: { content: audio },
    };

    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.ASR_GOOGLE_API_KEY}`;

    const response = await axios.post(url, requestBody);

    const transcription =
      response.data.results
        ?.map((result) => result.alternatives[0].transcript)
        .join("\n") || "";

    res.json({ transcription });
  } catch (err) {
    console.error("Error transcribing:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || "Failed to transcribe audio" });
  }
};

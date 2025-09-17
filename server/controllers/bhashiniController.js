import axios from "axios";

const endpoint = process.env.BHASHINI_ENDPOINT;
const userId = process.env.BHASHINI_USER_ID;
const apiKey = process.env.BHASHINI_API_KEY;
const pipelineId = process.env.BHASHINI_PIPELINE_ID;
const inferenceKey = process.env.BHASHINI_INFERENCE_KEY;

/** Translate text using Bhashini */
export const translateText = async (req, res) => {
  try {
    const { text, sourceLang = "en", targetLang = "hi" } = req.body;

    const response = await axios.post(
      endpoint,
      {
        pipelineId, // required
        inputData: {
          input: [
            {
              source: text,
            },
          ],
        },
        config: {
          translation: {
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          userID: userId,
          ulcaApiKey: apiKey,
          inferenceApiKey: inferenceKey,
        },
      }
    );

    console.log("Bhashini Translation Response:", response.data);

    // Updated path for translation output
    const translatedText =
      response.data?.pipelineResponse?.find(task => task.taskType === "translation")
        ?.output?.[0]?.target;

    res.json({ success: true, translatedText });
  } catch (error) {
    console.error("Translation Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/** Speech-to-Text using Bhashini */
export const speechToText = async (req, res) => {
  try {
    const { audioBase64, sourceLang = "hi" } = req.body;

    const response = await axios.post(
      endpoint,
      {
        pipelineId, // required
        inputData: {
          audio: [
            {
              audioContent: audioBase64,
            },
          ],
        },
        config: {
          asr: {
            sourceLanguage: sourceLang,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          userID: userId,
          ulcaApiKey: apiKey,
          inferenceApiKey: inferenceKey,
        },
      }
    );

    console.log("Bhashini ASR Response:", response.data);

    const text =
      response.data?.pipelineResponse?.find(task => task.taskType === "asr")
        ?.output?.[0]?.source;

    res.json({ success: true, text });
  } catch (error) {
    console.error("ASR Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

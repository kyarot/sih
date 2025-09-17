import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function fetchPipeline() {
  try {
    const response = await axios.post(
      "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
      {
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: "en",
                targetLanguage: "hi",
              },
            },
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          userID: process.env.BHASHINI_USER_ID,
          ulcaApiKey: process.env.BHASHINI_API_KEY,
        },
      }
    );

    console.log("Pipeline Info:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Fetch Pipeline Error:", error.response?.data || error.message);
  }
}

fetchPipeline();

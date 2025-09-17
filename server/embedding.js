import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
dotenv.config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const getEmbedding = async (text) => {
  const response = await client.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });

  return response.data[0].embedding;
};

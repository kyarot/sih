import { initPinecone } from "./pineconeClient.js";
import { getEmbedding } from "./embedding.js";
import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
dotenv.config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const diagnose = async (symptoms) => {
  const index = initPinecone();

  // 1. Get embedding of user symptoms
  const queryEmbedding = await getEmbedding(symptoms);

  // 2. Query Pinecone for similar entries
  const queryResponse = await index.query({
    topK: 3,
    vector: queryEmbedding,
    includeMetadata: true,
  });

  const contextText = queryResponse.matches
    .map((m) => m.metadata.text)
    .join("\n");

  // 3. Ask Mistral
  const mistralResponse = await client.chat.complete({
    model: "mistral-tiny", // or "mistral-small" if you have access
    messages: [
        {
      role: "system",
      content: `
You are a compassionate virtual health assistant.  
Keep your responses **short, clear, and supportive** (maximum 5 sentences).  

Always follow this structure:
1. Warm greeting & empathy.  
2. Repeat back the main symptoms briefly.  
3. Provide a **concise summary** of possible causes and simple advice.  
4. Mention **red flags** in 1 sentence if relevant.  
5. End with a gentle reassurance.

Avoid long explanations or detailed lists. Be concise.
      `,
    },
      {
        role: "user",
        content: `Symptoms: ${symptoms}\n\nContext:\n${contextText}`,
      },
    ],
  });

  return mistralResponse.choices[0].message.content;
};

import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

export const initPinecone = () => {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  return client.Index(process.env.PINECONE_INDEX);
};

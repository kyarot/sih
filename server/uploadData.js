import fs from "fs";
import csv from "csv-parser";
import { initPinecone } from "./pineconeClient.js";
import { getEmbedding } from "./embedding.js";

const uploadCSVToPinecone = async () => {
  const index = initPinecone();
  const records = [];

  fs.createReadStream("diseases1.csv")
    .pipe(csv())
    .on("data", (row) => {
      const text = `Disease: ${row.disease}. Symptoms: ${row.symptoms}. Preventive Measures: ${row.preventive_measures}.`;
      records.push({ id: row.disease, text });
    })
    .on("end", async () => {
      console.log("CSV loaded:", records.length, "records");

      for (const rec of records) {
        const embedding = await getEmbedding(rec.text);

        await index.upsert([
          {
            id: rec.id,
            values: embedding,
            metadata: { text: rec.text },
          },
        ]);
      }

      console.log("Data uploaded to Pinecone ✅");
    });
};

uploadCSVToPinecone();

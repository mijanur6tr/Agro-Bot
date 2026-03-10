import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required environment variable: GEMINI_API_KEY");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function createEmbedding(text: string): Promise<number[]> {
  
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot create embedding for empty text");
  }

  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text.trim(),
    });

    if (!result.embeddings?.[0]?.values || result.embeddings[0].values.length === 0) {
      throw new Error("No embedding values returned from API");
    }
    console.log("Embedding created successfully");

    

    return result.embeddings[0].values;  // Extract the values array from first object
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw new Error("Failed to create embedding for text");
  }
}

// createEmbedding("What is the meaning of life? Do any of us knows?").then(embedding => {
//   console.log("Embedding vector length:", embedding.length);
// }).catch(error => {
//   console.error("Error in embedding creation:", error);
// });

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map((text) => createEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error("Error creating embeddings:", error);
    throw new Error("Failed to create embeddings");
  }
}

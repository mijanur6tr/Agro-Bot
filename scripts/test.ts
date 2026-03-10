import "dotenv/config";
import { GoogleGenAI } from "@google/genai";



if (!process.env.GEMINI_API_KEY) {
  console.error("Error: Missing required environment variable: GEMINI_API_KEY");
  process.exit(1);
}


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "Explain how AI works in a simple way.",
//   });
//   console.log(response.text);

// for embedding
const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: 'What is the meaning of life?',
    });

    console.log(response.embeddings);
}

main();
import "dotenv/config";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required environment variable: GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Text generation model
export const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});


export async function generateResponse(
  prompt: string,
  options?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  try {
    console.log("Generating response with prompt:", prompt);
    // const generationConfig = {
    //   temperature: options?.temperature || 0.7,
    //   topK: options?.topK || 40,
    //   topP: options?.topP || 0.95,
    //   maxOutputTokens: options?.maxOutputTokens || 2048,
    // };

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return response;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from Gemini");
  }
}

// testing the generateResponse function
// generateResponse("What are the benefits of crop rotation in sustainable agriculture?", {
//   temperature: 0.7,
//   topK: 40,
//   topP: 0.95,
//   maxOutputTokens: 2048
// })
//   .then((response) => {
//     console.log("Generated response:", response);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

export async function streamResponse(
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const stream = await model.generateContentStream(prompt);

    let fullText = "";

    for await (const chunk of stream.stream) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = chunk.candidates[0].content.parts[0].text;
        fullText += text;
        if (onChunk) onChunk(text);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Error streaming response:", error);
    throw new Error("Failed to stream response from Gemini");
  }
}

// streamResponse("What are the benefits of crop rotation in sustainable agriculture?", (chunk) => {
//   console.log("Received chunk:", chunk);
// })
//   .then((fullResponse) => {
//     console.log("Full response:", fullResponse);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

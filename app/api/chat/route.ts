import { NextRequest } from "next/server";
import { streamResponse } from "@/ai/gemini";
import { getRelevantContext } from "@/ai/vectorSearch";
import { buildSafeRAGPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

interface ChatRequest {
  question: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  contextChunks?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { question, conversationHistory = [], contextChunks = 5 } = body;

    // Validate input
    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Question cannot be empty",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Step 1: Retrieve relevant context using vector search
    console.log("[CHAT API] Retrieving relevant context...");
    const contextResults = await getRelevantContext(question, contextChunks);

    // Checking the context is proper or not
    if (contextResults.length === 0) {
      console.warn("[CHAT API] No relevant context found");
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "No relevant information found in the knowledge base. Please try a different question.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const contextDocuments = contextResults.map((result) => result.text);

    // Step 2: Build comprehensive prompt with context
    const prompt = buildSafeRAGPrompt(question, contextDocuments);

    // Step 3: Stream response using Gemini
    const stream = new ReadableStream({
      start(controller) {
        // Send sources first
        const sources = contextResults
          .map((result) => (result.metadata as { source?: string })?.source)
          .filter((source) => source !== undefined);
        
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "sources",
            data: sources.length > 0 ? sources : undefined,
          })}\n\n`
        );

        // Stream response chunks
        streamResponse(prompt, (chunk) => {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "chunk",
              data: chunk,
            })}\n\n`
          );
        }).then((fullText) => {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "complete",
              data: fullText,
            })}\n\n`
          );
          controller.close();
        }).catch((error) => {
          console.error("[CHAT API] Streaming error:", error);
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "error",
              data: error.message || "Failed to stream response",
            })}\n\n`
          );
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("[CHAT API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Please use POST method for chat requests",
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

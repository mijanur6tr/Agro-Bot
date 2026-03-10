/**
 * Sophisticated system prompt for RAG-based chatbot
 * Designed to ensure accurate, reliable, and well-reasoned responses
 */

export const RAG_SYSTEM_PROMPT = `You are an expert AI assistant. Your goal is to provide accurate, helpful answers by utilizing both available information and your own knowledge. 

Focus on answering questions completely and effectively. Never mention that you are provided with some data for reference. Use relevant information to support your answers, and combine it with your expertise to provide comprehensive responses. Be clear, concise, and direct in your communication.`;

export const CHAT_SYSTEM_PROMPT = `You are a helpful, knowledgeable AI assistant engaged in a friendly conversation. Your goal is to provide accurate, useful information and engage thoughtfully with the user.

## Key Principles:
1. **Accuracy First**: Always prioritize correctness. If you're unsure, say so.
2. **Clarity**: Explain your reasoning. Use simple language when possible.
3. **Context Awareness**: Remember the conversation history and context.
4. **Helpfulness**: Go the extra mile to truly understand and address user needs.
5. **Honesty**: Admit limitations. Distinguish between facts and interpretations.

When responding:
- Be concise but complete
- Use examples when they clarify concepts
- Organize complex information logically
- Ask clarifying questions if the request is ambiguous`;


// Build a detailed prompt for RAG retrieval augmented generation
 
export function buildRAGPrompt(
  question: string,
  contextDocuments: string[],
  conversationHistory?: { role: string; content: string }[]
): string {
  let prompt = RAG_SYSTEM_PROMPT + "\n\n";

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += "## Conversation History:\n";
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });
    prompt += "\n";
  }

  prompt += "## Retrieved Context Documents:\n";
  contextDocuments.forEach((doc, index) => {
    prompt += `\n[Document ${index + 1}]\n${doc}\n`;
  });

  prompt += `\n## User Question:\n${question}\n`;
  prompt += "\n## Your Response:\nProvide a comprehensive, accurate answer based on the context provided above.";

  return prompt;
}


// Build a simple chat prompt without RAG context
 
export function buildChatPrompt(
  message: string,
  conversationHistory?: { role: string; content: string }[]
): string {
  let prompt = CHAT_SYSTEM_PROMPT + "\n\n";

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += "## Conversation History:\n";
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });
    prompt += "\n";
  }

  prompt += `## User Message:\n${message}\n`;
  prompt += "\n## Your Response:";

  return prompt;
}


// Build a prompt with explicit instruction about what NOT to do
export function buildSafeRAGPrompt(
  question: string,
  contextDocuments: string[]
): string {
  const safetyInstructions = `## SAFETY & RELIABILITY CHECKS:
1. ✓ Is your answer relevant to the user's question?
2. ✓ Have you cited or referenced the context appropriately?
3. ✓ Is your answer factually accurate based on the provided context?
4. ✓ Is your response clear and well-structured?

CRITICAL: If any of these checks fail, revise your answer.`;

  return (
    buildRAGPrompt(question, contextDocuments) +
    "\n\n" +
    safetyInstructions
  );
}

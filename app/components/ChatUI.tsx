"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);

  const createMessageId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    messageCounterRef.current += 1;
    return `${Date.now()}-${messageCounterRef.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    // Add user message to chat
    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: trimmedQuestion,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Create empty assistant message for streaming
    const assistantMessageId = createMessageId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      sources: undefined,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          contextChunks: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("No readable stream available");
      }

      let accumulatedContent = "";
      let sources: string[] | undefined;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "chunk") {
                accumulatedContent += data.data;
                // Update the assistant message with new content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === "sources") {
                sources = data.data;
              } else if (data.type === "error") {
                throw new Error(data.data);
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      // Update the final message with sources
      if (sources) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, sources }
              : msg
          )
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Chat error:", err);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuestion(input);
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    await sendQuestion(question);
  };

  const quickQuestions = [
    "What vegetables are best for post-apocalyptic farming?",
    "What are the best vegetables for roof top gardening?",
    "Which vegetables are very important for children growth?",
    "Historic practises of vegetable cultivation in war times",
    "Best practices for soil fertility after nuclear events"
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7_0%,#f0fdf4_45%,#f8fafc_100%)] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white/85 shadow-[0_20px_80px_rgba(16,185,129,0.15)] backdrop-blur-sm sm:h-[calc(100vh-3rem)]">
        <header className="border-b border-emerald-100 bg-white/90 px-4 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Agro Assistant</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Agro-Bot Chat</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            WW3 may disrupt food supplies. Your garden is the solution ~ Agro-Bot will guide you.
          </p>
        </header>

        <main className="scrollbar-hide flex-1 overflow-y-auto bg-linear-to-b from-emerald-50/35 to-white px-3 py-4 sm:px-6 sm:py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="w-full max-w-3xl text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Welcome to Agro-Bot</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Start with a question or try one of these prompts.
              </p>
              
              {/* Quick Questions */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      void handleQuickQuestion(question);
                    }}
                    className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const hideAssistantPlaceholder =
            isLoading &&
            message.role === "assistant" &&
            message.content.trim().length === 0;

          if (hideAssistantPlaceholder) {
            return null;
          }

          return (
          <div
            key={message.id}
            className={`mb-4 flex animate-fadeIn ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`w-fit max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                message.role === "user"
                  ? "rounded-br-md bg-emerald-600 text-white shadow-md"
                  : "rounded-bl-md border border-emerald-100 bg-white text-slate-900 shadow-sm"
              }`}
            >
              <p className={`mb-2 text-xs font-semibold ${message.role === "user" ? "text-emerald-100" : "text-emerald-700"}`}>
                {message.role === "user" ? "You" : "Agro-Bot"}
              </p>
              <div className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  components={{
                    h1: ({ ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-semibold mt-3 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                    strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                    em: ({ ...props }) => <em className="italic" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                    li: ({ ...props }) => <li className="text-sm leading-relaxed" {...props} />,
                    code: ({ ...props }) => <code className="rounded bg-emerald-100 px-1 py-0.5 text-xs text-emerald-900" {...props} />,
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-3 italic my-2" {...props} />,
                    a: ({ ...props }) => <a className="text-emerald-600 underline hover:text-emerald-800" {...props} />
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 border-t border-emerald-200 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSources((prev) => ({
                        ...prev,
                        [message.id]: !prev[message.id],
                      }));
                    }}
                    className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                  >
                    Sources
                  </button>
                  {expandedSources[message.id] && (
                    <ul className="mt-2 text-xs space-y-1">
                      {message.sources.map((source, idx) => (
                        <li key={idx} className="truncate text-emerald-700">
                          - {source}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <p className={`mt-2 text-[11px] ${message.role === "user" ? "text-emerald-100/80" : "text-slate-500"}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-emerald-100 bg-white px-4 py-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-emerald-700">Agro-Bot</p>
              <div className="flex space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
        </main>

      {/* Input Area */}
      <div className="border-t border-emerald-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about vegetable cultivation..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isLoading ? "Sending..." : <Send className="h-5 w-5" />}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Tip: Ask one detailed question at a time for more precise answers.
        </p>
      </div>
              
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

      `}</style>
    </div>
  );
}
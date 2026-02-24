"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function CallPage() {
  const searchParams = useSearchParams();

  const store = searchParams.get("store");
  const product = searchParams.get("product");
  const details = searchParams.get("details");

  const [status, setStatus] = useState("Initializing brain...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ------------------------
  // Start Session
  // ------------------------
  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/session/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store,
            product,
            details,
          }),
        });

        const data = await response.json();

        setSessionId(data.session_id);
        setStatus("AI Connected");

        setMessages([
          {
            role: "assistant",
            content: data.assistant_message,
          },
        ]);
      } catch (error) {
        console.error(error);
        setStatus("Connection failed");
      }
    };

    startSession();
  }, [store, product, details]);

  // ------------------------
  // Send Message
  // ------------------------
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await fetch("http://127.0.0.1:8000/session/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: userMessage.content,
      }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.assistant_message,
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">

      {/* Header */}
      <div className="border-b border-white/10 p-4 text-center text-sm text-gray-400">
        {status}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 max-w-3xl w-full mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`px-5 py-3 rounded-2xl max-w-md text-sm ${
                msg.role === "assistant"
                  ? "bg-white/10 text-white"
                  : "bg-white text-black"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Input */}
      <div className="border-t border-white/10 p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your response..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition"
          />

          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
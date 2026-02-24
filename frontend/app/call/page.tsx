"use client";

import { useEffect, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SessionData {
  completed: boolean;
  invoiceUrl: string | null;
}

export default function CallPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  // -------------------------------
  // Start Session
  // -------------------------------
  useEffect(() => {
    const startSession = async () => {
      const res = await fetch("http://localhost:8000/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: "Apple Computers",
          product: "MacBook Pro",
          details: "Display screen repair",
        }),
      });

      const data = await res.json();
      setSessionId(data.session_id);

      setMessages([
        {
          role: "assistant",
          content: data.assistant_message,
        },
      ]);
    };

    startSession();
  }, []);

  // -------------------------------
  // Send Message
  // -------------------------------
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");

    const res = await fetch("http://localhost:8000/session/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: userMessage }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.assistant_message,
      },
    ]);

    if (data.completed) {
      setCompleted(true);
    }

    if (data.invoice_url) {
      setInvoiceUrl(data.invoice_url);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="w-full max-w-4xl h-[85vh] bg-[#111827] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="py-4 text-center text-gray-400 border-b border-white/10">
          AI Connected
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "assistant"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`max-w-md px-6 py-4 rounded-2xl ${
                  msg.role === "assistant"
                    ? "bg-white/10 text-white"
                    : "bg-white text-black"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        {!completed && (
          <div className="p-6 border-t border-white/10 flex gap-4">
            <input
              type="text"
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition"
            >
              Send
            </button>
          </div>
        )}

        {completed && (
          <div className="p-6 border-t border-white/10">
            <div className="text-center text-green-400 mb-4">
              Booking completed successfully.
            </div>
            {invoiceUrl && (
              <div className="flex justify-center">
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-medium hover:opacity-90 transition shadow-lg"
                >
                  📄 Download Invoice
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
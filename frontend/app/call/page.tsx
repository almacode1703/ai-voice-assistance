"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function CallPage() {
  const [status, setStatus] = useState("Initializing brain...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationStep, setConversationStep] = useState(0);

  const searchParams = useSearchParams();
  const store = searchParams.get("store");
  const product = searchParams.get("product");
  const details = searchParams.get("details");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("AI Connected");

      setMessages([
        {
          role: "assistant",
          content: `Hello. I am contacting ${store} regarding ${product}. I will gather the required information now.`,
        },
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      let aiResponse: Message;

      switch (conversationStep) {
        case 0:
          aiResponse = {
            role: "assistant",
            content: "Thank you. Could you please tell me the cost per person?",
          };
          setConversationStep(1);
          break;

        case 1:
          aiResponse = {
            role: "assistant",
            content: "Understood. Is the requested time slot available?",
          };
          setConversationStep(2);
          break;

        case 2:
          aiResponse = {
            role: "assistant",
            content:
              "Great. I am now confirming the reservation. Please provide the name for the booking.",
          };
          setConversationStep(3);
          break;

        case 3:
          aiResponse = {
            role: "assistant",
            content:
              "Reservation confirmed. Thank you. The booking has been completed successfully.",
          };
          setConversationStep(4);
          break;

        default:
          aiResponse = {
            role: "assistant",
            content: "The session has been completed.",
          };
      }

      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
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

      {/* Bottom Control Area */}
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

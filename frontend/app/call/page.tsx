"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CallPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -------------------------------
  // GSAP Page Load Animation
  // -------------------------------
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, []);

  // -------------------------------
  // Auto-scroll to bottom
  // -------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setIsTyping(true);

    const res = await fetch("http://localhost:8000/session/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: userMessage }),
    });

    const data = await res.json();

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.assistant_message,
        },
      ]);
      setIsTyping(false);

      if (data.completed) {
        setCompleted(true);
      }

      if (data.invoice_url) {
        setInvoiceUrl(data.invoice_url);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#1a1f35] to-[#0B0F19] text-white flex items-center justify-center p-4">
      <motion.div
        ref={containerRef}
        className="w-full max-w-5xl h-[90vh] bg-gradient-to-br from-[#111827]/90 to-[#1f2937]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="relative py-6 px-8 text-center border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <SparklesIcon className="w-6 h-6 text-blue-400" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Voice Assistant
            </h1>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <SparklesIcon className="w-6 h-6 text-purple-400" />
            </motion.div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Connected & Ready</p>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                className={`flex ${
                  msg.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10"
                      : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </motion.div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10">
                  <div className="flex gap-2">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-pink-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!completed && (
          <motion.div
            className="p-6 border-t border-white/10 bg-gradient-to-r from-[#111827]/50 to-[#1f2937]/50 backdrop-blur-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-4">
              <motion.input
                type="text"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                onClick={sendMessage}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg flex items-center gap-2 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Send</span>
                <PaperAirplaneIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Completion Area with Invoice */}
        {completed && (
          <motion.div
            className="p-8 border-t border-white/10 bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-green-400">
                Booking Completed Successfully!
              </h2>
            </motion.div>

            {invoiceUrl && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <motion.a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-semibold shadow-2xl flex items-center gap-3 overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Content */}
                  <span className="relative z-10 text-lg">Download Invoice</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <DocumentArrowDownIcon className="w-6 h-6" />
                  </motion.div>
                </motion.a>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

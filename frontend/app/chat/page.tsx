"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  HomeIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function CallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedSession = useRef(false);

  // Memoize URL parameters to prevent unnecessary re-renders
  const sessionParams = useMemo(() => ({
    store: searchParams.get("store") || "Apple Computers",
    product: searchParams.get("product") || "MacBook Pro",
    details: searchParams.get("details") || "Display screen repair",
  }), [searchParams]);

  // GSAP Page Load Animation
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start Session - only once
  useEffect(() => {
    // Prevent multiple session starts
    if (hasStartedSession.current) return;

    hasStartedSession.current = true;

    const startSession = async () => {
      try {
        console.log("Starting session with:", sessionParams);

        const res = await fetch("http://localhost:8001/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionParams),
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("Session started:", data);

        setSessionId(data.session_id);
        setMessages([
          {
            role: "assistant",
            content: data.assistant_message,
          },
        ]);
        setIsLoading(false);
      } catch (err) {
        console.error("Session start error:", err);
        setError("Failed to connect to backend. Please check if the server is running on port 8000.");
        setIsLoading(false);
      }
    };

    startSession();
  }, []); // Empty dependency array - only run once

  // Send Message
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isTyping) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8001/session/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMessage }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      console.log("Message response:", data);

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
    } catch (err) {
      console.error("Send message error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error sending your message. Please try again.",
        },
      ]);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-red-500/10 border-2 border-red-500/50 rounded-3xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 rounded-3xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <SparklesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Connecting to AI...</h2>
          <p className="text-gray-400">Please wait</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        ref={containerRef}
        className="w-full max-w-5xl h-[90vh] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative py-6 px-8 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-yellow-500/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 rounded-2xl blur-lg opacity-75" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <CpuChipIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  AI Voice Assistant
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-sm text-gray-400">Connected & Active</span>
                </div>
              </div>
            </div>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Home Button */}
              <motion.button
                onClick={() => invoiceUrl && router.push("/")}
                disabled={!invoiceUrl}
                className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 ${
                  invoiceUrl
                    ? "bg-gradient-to-br from-cyan-500 to-blue-500 cursor-pointer"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
                whileHover={invoiceUrl ? { scale: 1.1, rotate: 5 } : {}}
                whileTap={invoiceUrl ? { scale: 0.95 } : {}}
                title={invoiceUrl ? "Go to Home" : "Complete chat to enable"}
              >
                {invoiceUrl && (
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <HomeIcon className="w-6 h-6 text-white relative z-10" />
              </motion.button>

              {/* New Enquiry Button */}
              <motion.button
                onClick={() => invoiceUrl && router.push("/enquiry")}
                disabled={!invoiceUrl}
                className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 ${
                  invoiceUrl
                    ? "bg-gradient-to-br from-pink-500 to-rose-500 cursor-pointer"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
                whileHover={invoiceUrl ? { scale: 1.1, rotate: -5 } : {}}
                whileTap={invoiceUrl ? { scale: 0.95 } : {}}
                title={invoiceUrl ? "New Enquiry" : "Complete chat to enable"}
              >
                {invoiceUrl && (
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <PlusCircleIcon className="w-6 h-6 text-white relative z-10" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={`msg-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className={`flex gap-3 ${
                  msg.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </motion.div>
                )}

                {/* Message Bubble */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-lg px-6 py-4 rounded-3xl shadow-xl ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/20 backdrop-blur-xl"
                      : "bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 text-white"
                  }`}
                >
                  <p className="leading-relaxed text-lg">{msg.content}</p>
                </motion.div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <UserIcon className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-xl px-8 py-5 rounded-3xl border border-white/20 shadow-xl">
                  <div className="flex gap-2">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i === 0 ? "bg-cyan-400" : i === 1 ? "bg-pink-400" : "bg-yellow-400"
                        }`}
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay,
                        }}
                      />
                    ))}
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
            className="p-6 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-4">
              <motion.input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border-2 border-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 placeholder-gray-500 text-white text-lg backdrop-blur-xl"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: input.trim() && !isTyping ? 1.05 : 1, boxShadow: input.trim() && !isTyping ? "0 0 30px rgba(34, 211, 238, 0.6)" : undefined }}
                whileTap={{ scale: input.trim() && !isTyping ? 0.95 : 1 }}
              >
                <span>Send</span>
                <PaperAirplaneIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Completion Area */}
        {completed && (
          <motion.div
            className="p-8 border-t border-white/10 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-center gap-4 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircleIcon className="w-12 h-12 text-green-400" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
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
                  className="group relative bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-4 overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 40px rgba(34, 211, 238, 0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Content */}
                  <span className="relative z-10">Download Invoice</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <DocumentArrowDownIcon className="w-7 h-7" />
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

export default function CallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 rounded-3xl flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <SparklesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </motion.div>
      </div>
    }>
      <CallPageContent />
    </Suspense>
  );
}

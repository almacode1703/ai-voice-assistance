"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneIcon,
  PhoneXMarkIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  HomeIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

type CallState = "idle" | "connecting" | "active" | "listening" | "processing" | "completed";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function VoiceCallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const hasStartedSession = useRef(false);
  const transcriptTimerRef = useRef<any>(null);
  const lastTranscriptRef = useRef<string>("");

  // Memoize URL parameters
  const sessionParams = useMemo(() => ({
    store: searchParams.get("store") || "Apple Computers",
    product: searchParams.get("product") || "MacBook Pro",
    details: searchParams.get("details") || "Display screen repair",
  }), [searchParams]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Debug: Track sessionId changes
  useEffect(() => {
    console.log("🆔 Session ID changed to:", sessionId);
  }, [sessionId]);

  // Start Session
  const startSession = async () => {
    console.log("🚀 Starting session...");

    if (hasStartedSession.current) {
      console.log("⚠️ Session already started, skipping...");
      return;
    }
    hasStartedSession.current = true;

    setCallState("connecting");

    try {
      console.log("📤 Calling /session/start with params:", sessionParams);

      const res = await fetch("http://localhost:8000/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionParams),
      });

      console.log("📥 Session start response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Session created successfully:", data);
      console.log("🆔 Session ID:", data.session_id);

      setSessionId(data.session_id);
      setMessages([{ role: "assistant", content: data.assistant_message }]);

      console.log("✅ Session ID set in state:", data.session_id);

      // Speak the greeting
      setTimeout(() => {
        console.log("🔊 Speaking greeting message...");
        speakText(data.assistant_message);
        setCallState("active");
      }, 1000);

    } catch (err) {
      console.error("❌ Session start error:", err);
      setError(`Failed to connect to backend: ${err}`);
      setCallState("idle");
      hasStartedSession.current = false; // Allow retry
    }
  };

  // Text-to-Speech
  const speakText = (text: string) => {
    console.log("🔊 AI will speak:", text);

    if (!synthRef.current) {
      console.error("❌ Speech synthesis not available");
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log("▶️ AI started speaking");
      setAiSpeaking(true);
      setCallState("active");
    };

    utterance.onend = () => {
      console.log("⏹️ AI finished speaking");
      setAiSpeaking(false);
      if (!completed) {
        console.log("🎤 Will auto-start listening in 500ms...");
        // Start listening after AI finishes speaking
        setTimeout(() => {
          console.log("🎤 Auto-starting listening now...");
          startListening();
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error("❌ Speech synthesis error:", event);
    };

    synthRef.current.speak(utterance);
  };

  // Speech Recognition
  const startListening = () => {
    console.log("🎤 Starting speech recognition...");

    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("✅ Speech recognition started - You can speak now!");
      setCallState("listening");
      setCurrentTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      console.log(finalTranscript ? "✅ FINAL:" : "⏳ INTERIM:", currentText);
      setCurrentTranscript(currentText);
      lastTranscriptRef.current = currentText;

      // Clear existing timer
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
      }

      if (finalTranscript) {
        console.log("✅ Final transcript received, sending immediately:", finalTranscript);
        // Stop recognition before sending message
        recognition.stop();
        sendMessage(finalTranscript);
      } else if (interimTranscript) {
        // Set a timer to auto-send after 2 seconds of no new speech
        console.log("⏰ Setting 2-second timer for auto-send...");
        transcriptTimerRef.current = setTimeout(() => {
          console.log("⏰ Timer expired! Auto-sending transcript:", lastTranscriptRef.current);
          if (lastTranscriptRef.current.trim()) {
            recognition.stop();
            sendMessage(lastTranscriptRef.current);
          }
        }, 2000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access and refresh the page.");
      } else if (event.error === "no-speech") {
        console.log("⚠️ No speech detected, restarting...");
        // Auto-restart if no speech detected
        setTimeout(() => {
          if (!completed && callState !== "completed") {
            startListening();
          }
        }, 1000);
      }
      setCallState("active");
    };

    recognition.onend = () => {
      console.log("🛑 Speech recognition ended");
      if (callState === "listening") {
        setCallState("processing");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("❌ Failed to start recognition:", error);
      alert("Failed to start microphone. Please check permissions.");
    }
  };

  // Send Message to Backend
  const sendMessage = async (transcript: string) => {
    console.log("📤 Sending message to backend:", transcript);

    if (!sessionId) {
      console.error("❌ No session ID!");
      return;
    }

    if (!transcript.trim()) {
      console.error("❌ Empty transcript!");
      return;
    }

    setCallState("processing");
    setMessages((prev) => [...prev, { role: "user", content: transcript }]);
    setCurrentTranscript(""); // Clear transcript display

    try {
      console.log("🌐 Making API call to backend...");
      console.log("Session ID:", sessionId);
      console.log("Message:", transcript);

      const res = await fetch("http://localhost:8000/session/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: transcript }),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("📦 Received data from backend:", data);

      setMessages((prev) => [...prev, { role: "assistant", content: data.assistant_message }]);

      if (data.completed) {
        console.log("✅ Booking completed!");
        setCompleted(true);
        setCallState("completed");
      }

      if (data.invoice_url) {
        console.log("📄 Invoice URL received:", data.invoice_url);
        setInvoiceUrl(data.invoice_url);
      }

      // Speak AI response
      console.log("🔊 Will speak AI response in 500ms...");
      setTimeout(() => {
        speakText(data.assistant_message);
      }, 500);

    } catch (err) {
      console.error("❌ Send message error:", err);
      alert(`Error communicating with backend: ${err}`);
      setCallState("active");
    }
  };

  // Start Call
  const handleStartCall = () => {
    startSession();
  };

  // End Call
  const handleEndCall = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    router.push("/");
  };

  // Waveform Animation Component
  const WaveformBars = () => (
    <div className="flex items-center justify-center gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-white rounded-full"
          animate={{
            height: aiSpeaking || callState === "listening" ? [10, 25, 10] : 10,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );

  // Get status text
  const getStatusText = () => {
    switch (callState) {
      case "idle":
        return "Ready to call";
      case "connecting":
        return "Connecting...";
      case "active":
        return "AI is speaking...";
      case "listening":
        return "Listening to you...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Call completed!";
      default:
        return "";
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (callState) {
      case "listening":
        return "from-green-400 to-emerald-500";
      case "active":
        return "from-cyan-400 to-blue-500";
      case "processing":
        return "from-yellow-400 to-orange-500";
      case "completed":
        return "from-green-400 to-emerald-500";
      default:
        return "from-gray-400 to-gray-500";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Call Interface */}
      <motion.div
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Navigation */}
        <div className="flex justify-end gap-3 mb-6">
          <motion.button
            onClick={() => invoiceUrl && router.push("/")}
            disabled={!invoiceUrl}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              invoiceUrl
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 cursor-pointer"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
            whileHover={invoiceUrl ? { scale: 1.1, rotate: 5 } : {}}
            whileTap={invoiceUrl ? { scale: 0.95 } : {}}
            title={invoiceUrl ? "Go to Home" : "Complete call to enable"}
          >
            <HomeIcon className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            onClick={() => invoiceUrl && router.push("/enquiry")}
            disabled={!invoiceUrl}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              invoiceUrl
                ? "bg-gradient-to-br from-pink-500 to-rose-500 cursor-pointer"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
            whileHover={invoiceUrl ? { scale: 1.1, rotate: -5 } : {}}
            whileTap={invoiceUrl ? { scale: 0.95 } : {}}
            title={invoiceUrl ? "New Enquiry" : "Complete call to enable"}
          >
            <PlusCircleIcon className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Call Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl"
          layout
        >
          {/* AI Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            {/* Animated Avatar */}
            <div className="relative mb-6">
              {/* Pulsing Rings */}
              <AnimatePresence>
                {(callState === "active" || callState === "listening" || callState === "processing") && (
                  <>
                    <motion.div
                      className="absolute inset-0 -m-8 rounded-full border-4 border-cyan-400/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 -m-8 rounded-full border-4 border-pink-400/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute inset-0 -m-8 rounded-full border-4 border-yellow-400/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Main Avatar Circle */}
              <motion.div
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 flex items-center justify-center shadow-2xl"
                animate={{
                  scale: aiSpeaking ? [1, 1.05, 1] : 1,
                  rotate: callState === "connecting" ? 360 : 0,
                }}
                transition={{
                  scale: { duration: 0.5, repeat: aiSpeaking ? Infinity : 0 },
                  rotate: { duration: 2, repeat: callState === "connecting" ? Infinity : 0, ease: "linear" },
                }}
              >
                <div className="w-36 h-36 rounded-full bg-slate-900 flex items-center justify-center">
                  {callState === "listening" ? (
                    <MicrophoneIcon className="w-20 h-20 text-green-400" />
                  ) : callState === "completed" ? (
                    <CheckCircleIcon className="w-20 h-20 text-green-400" />
                  ) : (
                    <SpeakerWaveIcon className="w-20 h-20 text-cyan-400" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Status Text */}
            <motion.div
              className={`px-6 py-3 rounded-full bg-gradient-to-r ${getStatusColor()} shadow-lg mb-4`}
              key={callState}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <p className="text-white font-bold text-lg">{getStatusText()}</p>
            </motion.div>

            {/* Waveform Visualization */}
            {(aiSpeaking || callState === "listening") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <WaveformBars />
              </motion.div>
            )}

            {/* Store Info */}
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-white mb-1">{sessionParams.store}</p>
              <p className="text-gray-400">{sessionParams.product}</p>
              <p className="text-sm text-gray-500">{sessionParams.details}</p>
            </div>
          </div>

          {/* Live Transcription */}
          <AnimatePresence mode="wait">
            {currentTranscript && callState === "listening" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10"
              >
                <p className="text-sm text-gray-400 mb-2">You're saying:</p>
                <p className="text-white text-lg mb-4">{currentTranscript}</p>

                {/* Manual Send Button */}
                <motion.button
                  onClick={() => {
                    if (recognitionRef.current) {
                      recognitionRef.current.stop();
                    }
                    if (transcriptTimerRef.current) {
                      clearTimeout(transcriptTimerRef.current);
                    }
                    sendMessage(currentTranscript);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Send Now
                </motion.button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Or wait 2 seconds to auto-send
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation History */}
          {messages.length > 0 && (
            <motion.div
              className="bg-white/5 rounded-2xl p-6 mb-6 max-h-40 overflow-y-auto border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-gray-400 mb-3">Conversation:</p>
              <div className="space-y-2">
                {messages.slice(-3).map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className={msg.role === "assistant" ? "text-cyan-400" : "text-pink-400"}>
                      {msg.role === "assistant" ? "AI" : "You"}:
                    </span>
                    <span className="text-white ml-2">{msg.content}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call Action Buttons */}
          <div className="flex gap-6 justify-center items-center">
            {callState === "idle" && (
              <motion.button
                onClick={handleStartCall}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <PhoneIcon className="w-10 h-10 text-white" />
              </motion.button>
            )}

            {/* Manual Tap to Speak Button (when AI finishes speaking) */}
            {callState === "active" && !aiSpeaking && (
              <motion.button
                onClick={startListening}
                className="px-8 py-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <MicrophoneIcon className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">Tap to Speak</span>
              </motion.button>
            )}

            {callState !== "idle" && callState !== "completed" && (
              <motion.button
                onClick={handleEndCall}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <PhoneXMarkIcon className="w-10 h-10 text-white" />
              </motion.button>
            )}
          </div>

          {/* Invoice Section */}
          {completed && invoiceUrl && (
            <motion.div
              className="mt-8 pt-8 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <CheckCircleIcon className="w-16 h-16 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-400">Booking Confirmed!</h3>
                <motion.a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(34, 211, 238, 0.8)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Download Invoice</span>
                  <DocumentArrowDownIcon className="w-6 h-6" />
                </motion.a>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Browser Compatibility Note */}
        <motion.p
          className="text-center text-gray-500 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 Best experience on Chrome/Edge with microphone enabled
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function VoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <PhoneIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Loading Voice Call...</h2>
        </div>
      </div>
    }>
      <VoiceCallContent />
    </Suspense>
  );
}

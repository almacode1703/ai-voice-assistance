"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

interface FeedbackResult {
  sentiment: "positive" | "neutral" | "negative";
  rating: number;
  summary: string;
  key_points: string[];
  emotion: string;
}

export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const submitFeedback = async () => {
    if (!text.trim()) return;

    setLoadingSubmit(true);

    try {
      const res = await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const rewriteText = async () => {
    if (text.length < 20) return;

    setLoadingRewrite(true);

    try {
      const res = await fetch("http://localhost:8000/feedback/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setText(data.improved_text);
    } catch (error) {
      console.error("Rewrite error:", error);
    } finally {
      setLoadingRewrite(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-400 to-emerald-500";
      case "negative":
        return "from-red-400 to-rose-500";
      default:
        return "from-yellow-400 to-orange-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <FaceSmileIcon className="w-12 h-12 text-green-400" />;
      case "negative":
        return <FaceFrownIcon className="w-12 h-12 text-red-400" />;
      default:
        return <HandThumbUpIcon className="w-12 h-12 text-yellow-400" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
        className={`text-3xl ${i < rating ? "text-yellow-400" : "text-gray-600"}`}
      >
        ★
      </motion.span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="w-full max-w-3xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Main Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 p-5 shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChatBubbleLeftRightIcon className="w-full h-full text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2">
              Share Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Feedback
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Help us improve by sharing your thoughts and experiences
            </p>
          </div>

          {/* Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your experience... (min 20 characters)"
              className="w-full h-40 p-6 rounded-2xl bg-white/5 border-2 border-white/10 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder-gray-500 text-lg resize-none"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {text.length} characters
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {/* AI Improve Button */}
            <motion.button
              onClick={rewriteText}
              disabled={text.length < 20 || loadingRewrite}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                text.length >= 20 && !loadingRewrite
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={text.length >= 20 && !loadingRewrite ? { scale: 1.02 } : {}}
              whileTap={text.length >= 20 && !loadingRewrite ? { scale: 0.98 } : {}}
            >
              {loadingRewrite ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  AI Improving...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Improve with AI
                </>
              )}
            </motion.button>

            {/* Submit Button */}
            <motion.button
              onClick={submitFeedback}
              disabled={!text.trim() || loadingSubmit}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                text.trim() && !loadingSubmit
                  ? "bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={text.trim() && !loadingSubmit ? { scale: 1.02 } : {}}
              whileTap={text.trim() && !loadingSubmit ? { scale: 0.98 } : {}}
            >
              {loadingSubmit ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Analysis Results
              </h2>

              {/* Sentiment */}
              <motion.div
                className="flex items-center justify-center gap-4 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {getSentimentIcon(result.sentiment)}
                <div>
                  <div className="text-sm text-gray-400">Sentiment</div>
                  <div
                    className={`text-2xl font-bold bg-gradient-to-r ${getSentimentColor(
                      result.sentiment
                    )} bg-clip-text text-transparent capitalize`}
                  >
                    {result.sentiment}
                  </div>
                </div>
              </motion.div>

              {/* Rating Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {renderStars(result.rating)}
              </div>

              {/* Rating Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Rating</span>
                  <span>{result.rating}/5</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className={`bg-gradient-to-r ${getSentimentColor(
                      result.sentiment
                    )} h-4`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.rating / 5) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Summary */}
              <motion.div
                className="bg-white/5 rounded-2xl p-6 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-sm text-gray-400 mb-2">Summary</div>
                <div className="text-white text-lg">{result.summary}</div>
              </motion.div>

              {/* Key Points */}
              {result.key_points && result.key_points.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="text-sm text-gray-400 mb-3">Key Points</div>
                  <div className="space-y-2">
                    {result.key_points.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-start gap-3 bg-white/5 rounded-xl p-4"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="text-white">{point}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Thank You Message */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="text-lg text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text font-semibold">
                  Thank you for your valuable feedback! 🎉
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

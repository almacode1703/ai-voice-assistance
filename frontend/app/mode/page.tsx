"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

function ModePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const store = searchParams.get("store");
  const product = searchParams.get("product");
  const details = searchParams.get("details");

  const query = `store=${encodeURIComponent(store || "")}&product=${encodeURIComponent(product || "")}&details=${encodeURIComponent(details || "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
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
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Title Section */}
          <div className="text-center space-y-6 mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 p-5 shadow-2xl">
                <ChatBubbleBottomCenterTextIcon className="w-full h-full text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Choose Your
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Interaction Mode
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-400 text-lg max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Select how you'd like to continue your conversation with our AI assistant
            </motion.p>
          </div>

          {/* Mode Selection Cards */}
          <div className="space-y-4">
            {/* Chat Option */}
            <motion.button
              onClick={() => router.push(`/call?${query}`)}
              className="group w-full relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">Continue as Chat</h3>
                    <p className="text-cyan-100 text-sm mt-1">Type your messages and get instant responses</p>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRightIcon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.button>

            {/* Voice Option */}
            <motion.button
              onClick={() => router.push(`/voice?${query}`)}
              className="group w-full relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <PhoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">Start Voice Call</h3>
                    <p className="text-pink-100 text-sm mt-1">Speak naturally with voice recognition</p>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRightIcon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.button>
          </div>

          {/* Info Section */}
          <motion.div
            className="mt-8 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">Fast</div>
                <div className="text-xs text-gray-400 mt-1">Instant replies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">Smart</div>
                <div className="text-xs text-gray-400 mt-1">AI-powered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">Easy</div>
                <div className="text-xs text-gray-400 mt-1">User-friendly</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Your Request Summary:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-medium">Store:</span>
              <span className="text-white">{store || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-pink-400 font-medium">Product:</span>
              <span className="text-white">{product || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-medium">Details:</span>
              <span className="text-white">{details || "N/A"}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ModePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    }>
      <ModePageContent />
    </Suspense>
  );
}

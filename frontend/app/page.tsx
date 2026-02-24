"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  PhoneIcon,
  RocketLaunchIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  const features = [
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: "Make Enquiries",
      description: "Book appointments and services with ease",
      color: "from-cyan-400 to-blue-500",
      iconColor: "text-cyan-400",
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: "Collect Feedback",
      description: "Gather valuable customer insights",
      color: "from-pink-400 to-rose-500",
      iconColor: "text-pink-400",
    },
    {
      icon: PhoneIcon,
      title: "Voice Assistant",
      description: "AI-powered voice interactions",
      color: "from-yellow-400 to-orange-500",
      iconColor: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full text-center space-y-16">
          {/* Header Section */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo/Icon */}
            <motion.div
              className="flex justify-center"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 rounded-3xl blur-xl opacity-50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 p-6 rounded-3xl">
                  <SparklesIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <div className="space-y-4">
              <motion.h1
                className="text-6xl md:text-7xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  Your AI Voice
                </span>
                <br />
                <span className="text-white">Assistant</span>
              </motion.h1>

              <motion.p
                className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Intelligent conversations, seamless bookings, and instant feedback collection.
                <br />
                <span className="text-transparent bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text font-semibold">
                  Powered by advanced AI technology.
                </span>
              </motion.p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="space-y-4">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mx-auto`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link href="/enquiry">
              <motion.button
                className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white text-lg font-bold rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(34, 211, 238, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-pink-500 to-cyan-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "-100%" }}
                  transition={{ duration: 0.8 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <RocketLaunchIcon className="w-6 h-6" />
                  Make an Enquiry
                </span>
              </motion.button>
            </Link>

            <Link href="/feedback">
              <motion.button
                className="px-12 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white text-lg font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, borderColor: "rgba(236, 72, 153, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  Collect Feedback
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats/Trust Section */}
          <motion.div
            className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {[
              { value: "24/7", label: "Available" },
              { value: "< 1s", label: "Response Time" },
              { value: "99%", label: "Accuracy" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

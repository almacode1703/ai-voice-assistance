"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export default function EnquiryPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [store, setStore] = useState("");
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleProceed = () => {
    const query = `store=${encodeURIComponent(
      store
    )}&product=${encodeURIComponent(
      product
    )}&details=${encodeURIComponent(details)}`;

    router.push(`/mode?${query}`);
  };

  const steps = [
    { number: 1, title: "Store", icon: BuildingStorefrontIcon, color: "from-cyan-400 to-blue-500" },
    { number: 2, title: "Product", icon: ShoppingBagIcon, color: "from-pink-400 to-rose-500" },
    { number: 3, title: "Details", icon: DocumentTextIcon, color: "from-yellow-400 to-orange-500" },
    { number: 4, title: "Review", icon: CheckCircleIcon, color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="w-full max-w-2xl relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-white/10 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {steps.map((s) => (
              <motion.div
                key={s.number}
                className="relative z-10 flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
                    step >= s.number
                      ? `bg-gradient-to-br ${s.color} shadow-lg`
                      : "bg-white/5 border border-white/20"
                  }`}
                  animate={{
                    scale: step === s.number ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 1, repeat: step === s.number ? Infinity : 0 }}
                >
                  <s.icon className={`w-8 h-8 ${step >= s.number ? "text-white" : "text-gray-500"}`} />
                </motion.div>
                <span
                  className={`text-xs font-medium ${
                    step >= s.number ? "text-white" : "text-gray-500"
                  }`}
                >
                  {s.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
          layout
        >
          <AnimatePresence mode="wait">
            {/* Step 1 - Store */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 p-5 shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BuildingStorefrontIcon className="w-full h-full text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">Store Name</h1>
                  <p className="text-gray-400">Which store would you like to contact?</p>
                </div>

                <input
                  type="text"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder="e.g., Apple Store, Best Buy"
                  className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/20 transition-all text-white placeholder-gray-500 text-lg"
                  autoFocus
                />

                <motion.button
                  disabled={!store}
                  onClick={nextStep}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                  whileHover={{ scale: store ? 1.02 : 1 }}
                  whileTap={{ scale: store ? 0.98 : 1 }}
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2 - Product */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 p-5 shadow-lg"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShoppingBagIcon className="w-full h-full text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">Product or Service</h1>
                  <p className="text-gray-400">What are you interested in?</p>
                </div>

                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g., MacBook Pro, iPhone 15"
                  className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-pink-400/50 focus:ring-4 focus:ring-pink-400/20 transition-all text-white placeholder-gray-500 text-lg"
                  autoFocus
                />

                <div className="flex gap-4">
                  <motion.button
                    onClick={prevStep}
                    className="w-full py-4 border-2 border-white/20 rounded-2xl text-white font-semibold hover:bg-white/5 flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                  </motion.button>

                  <motion.button
                    disabled={!product}
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                    whileHover={{ scale: product ? 1.02 : 1 }}
                    whileTap={{ scale: product ? 0.98 : 1 }}
                  >
                    Next
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3 - Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-5 shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DocumentTextIcon className="w-full h-full text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">Details Needed</h1>
                  <p className="text-gray-400">Tell us more about your request</p>
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g., Screen repair needed for MacBook Pro 2020"
                  className="w-full px-6 py-4 bg-black/40 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/20 transition-all text-white placeholder-gray-500 h-40 resize-none text-lg"
                  autoFocus
                />

                <div className="flex gap-4">
                  <motion.button
                    onClick={prevStep}
                    className="w-full py-4 border-2 border-white/20 rounded-2xl text-white font-semibold hover:bg-white/5 flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                  </motion.button>

                  <motion.button
                    disabled={!details}
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                    whileHover={{ scale: details ? 1.02 : 1 }}
                    whileTap={{ scale: details ? 0.98 : 1 }}
                  >
                    Next
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4 - Review */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 p-5 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircleIcon className="w-full h-full text-white" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">Review Details</h1>
                  <p className="text-gray-400">Everything looks good?</p>
                </div>

                <div className="space-y-4">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <BuildingStorefrontIcon className="w-6 h-6 text-cyan-400" />
                      <strong className="text-cyan-400">Store</strong>
                    </div>
                    <p className="text-white text-lg ml-9">{store}</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-2xl p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBagIcon className="w-6 h-6 text-pink-400" />
                      <strong className="text-pink-400">Product</strong>
                    </div>
                    <p className="text-white text-lg ml-9">{product}</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <DocumentTextIcon className="w-6 h-6 text-yellow-400" />
                      <strong className="text-yellow-400">Details</strong>
                    </div>
                    <p className="text-white text-lg ml-9">{details}</p>
                  </motion.div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={prevStep}
                    className="w-full py-4 border-2 border-white/20 rounded-2xl text-white font-semibold hover:bg-white/5 flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                  </motion.button>

                  <motion.button
                    onClick={handleProceed}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34, 197, 94, 0.6)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SparklesIcon className="w-5 h-5" />
                    Proceed
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function EnquiryPage() {
  const [step, setStep] = useState(1);
  const [store, setStore] = useState("");
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 space-y-8">

        <div className="text-center text-sm text-gray-400">
          Step {step} of 4
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-center">
              Store Name
            </h1>

            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Enter store name"
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition"
            />

            <button
              disabled={!store}
              onClick={nextStep}
              className="w-full py-4 bg-white text-black rounded-2xl font-medium disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-center">
              Product or Service
            </h1>

            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Enter product or service"
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition"
            />

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="w-full py-4 border border-white/20 rounded-2xl"
              >
                Back
              </button>

              <button
                disabled={!product}
                onClick={nextStep}
                className="w-full py-4 bg-white text-black rounded-2xl font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-center">
              Details Needed
            </h1>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what you need..."
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 h-32 resize-none transition"
            />

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="w-full py-4 border border-white/20 rounded-2xl"
              >
                Back
              </button>

              <button
                disabled={!details}
                onClick={nextStep}
                className="w-full py-4 bg-white text-black rounded-2xl font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-semibold">Review</h1>

            <div className="space-y-2 text-gray-300 text-left">
              <p><strong>Store:</strong> {store}</p>
              <p><strong>Product:</strong> {product}</p>
              <p><strong>Details:</strong> {details}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="w-full py-4 border border-white/20 rounded-2xl"
              >
                Back
              </button>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-medium">
                Proceed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
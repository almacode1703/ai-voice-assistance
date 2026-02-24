"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-10 space-y-8">

        {/* Step Indicator */}
        <div className="text-center text-xs text-gray-500 tracking-wider uppercase">
          Step {step} of 4
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-center tracking-tight">
              Store Name
            </h1>

            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Enter store name"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition"
            />

            <button
              disabled={!store}
              onClick={nextStep}
              className="w-full py-3 bg-white text-black rounded-xl font-medium disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-center tracking-tight">
              Product or Service
            </h1>

            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Enter product or service"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition"
            />

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="w-full py-3 border border-white/20 rounded-xl"
              >
                Back
              </button>

              <button
                disabled={!product}
                onClick={nextStep}
                className="w-full py-3 bg-white text-black rounded-xl font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-center tracking-tight">
              Details Needed
            </h1>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what you need..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 h-28 resize-none transition"
            />

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="w-full py-3 border border-white/20 rounded-xl"
              >
                Back
              </button>

              <button
                disabled={!details}
                onClick={nextStep}
                className="w-full py-3 bg-white text-black rounded-xl font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-center tracking-tight">
              Review
            </h1>

            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                <strong>Store:</strong> {store}
              </p>
              <p>
                <strong>Product:</strong> {product}
              </p>
              <p>
                <strong>Details:</strong> {details}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={prevStep}
                className="w-full py-3 border border-white/20 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={handleProceed}
                className="w-full py-3 bg-white text-black rounded-xl font-medium"
              >
                Proceed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
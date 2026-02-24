"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ModePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const store = searchParams.get("store");
  const product = searchParams.get("product");
  const details = searchParams.get("details");

  const query = `store=${encodeURIComponent(store || "")}&product=${encodeURIComponent(product || "")}&details=${encodeURIComponent(details || "")}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-10 space-y-8 text-center">

        <h1 className="text-2xl font-semibold">
          Choose Interaction Mode
        </h1>

        <p className="text-gray-400 text-sm">
          Would you like to continue via chat or start a voice call?
        </p>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => router.push(`/call?${query}`)}
            className="w-full py-3 bg-white text-black rounded-xl font-medium"
          >
            Continue as Chat
          </button>

          <button
            onClick={() => router.push(`/voice?${query}`)}
            className="w-full py-3 border border-white/20 rounded-xl"
          >
            Start Voice Call
          </button>
        </div>

      </div>
    </div>
  );
}
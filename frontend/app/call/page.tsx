"use client";

import { useEffect, useState } from "react";

export default function CallPage() {
  const [status, setStatus] = useState("Initializing brain...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("AI Session Ready");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-10 text-center space-y-6">

        <h1 className="text-2xl font-semibold">
          {status}
        </h1>

        <div className="text-sm text-gray-400">
          Preparing voice simulation environment...
        </div>

      </div>
    </div>
  );
}
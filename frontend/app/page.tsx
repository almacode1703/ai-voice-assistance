import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center space-y-12">
      {/* Headline Section */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          What should I handle for you today?
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          I am your AI Voice Assistant. I can book tables, collect feedback, and
          complete tasks for you.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          href="/enquiry"
          className="px-8 py-4 rounded-2xl bg-white text-black font-medium hover:opacity-90 transition text-center"
        >
          Make an Enquiry
        </Link>

        <Link
          href="/feedback"
          className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/5 transition text-center"
        >
          Collect Feedback
        </Link>
      </div>
    </main>
  );
}

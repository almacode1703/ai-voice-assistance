import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full text-center space-y-10">

        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            What should I handle for you today?
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            I am your AI Voice Assistant. I can book tables, collect feedback, and complete tasks for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
          <Link
            href="/enquiry"
            className="px-10 py-4 rounded-2xl bg-white text-black font-medium hover:opacity-90 transition"
          >
            Make an Enquiry
          </Link>

          <Link
            href="/feedback"
            className="px-10 py-4 rounded-2xl border border-white/20 hover:bg-white/5 transition"
          >
            Collect Feedback
          </Link>
        </div>

      </div>
    </div>
  );
}
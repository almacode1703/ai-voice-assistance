"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { AuthLeftPanel } from "../../components/AuthLeftPanel";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (res.ok) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.ok) {
          router.push("/");
        } else {
          router.push("/auth/login");
        }
      } else {
        const data = await res.json();
        setError(data.detail ?? "Registration failed. Please try again.");
      }
    } catch {
      setError("Connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    await signIn(provider, { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left decorative panel ── */}
      <AuthLeftPanel />

      {/* ── Right: form panel ── */}
      <motion.div
        className="flex-1 flex flex-col px-6 py-6 relative overflow-y-auto h-screen"
        animate={{
          backgroundColor: [
            "rgba(139,92,246,0.07)",
            "rgba(236,72,153,0.06)",
            "rgba(6,182,212,0.06)",
            "rgba(99,102,241,0.07)",
            "rgba(139,92,246,0.07)",
          ],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ backgroundColor: "rgba(139,92,246,0.07)" }}
      >
        {/* Subtle ambient orbs */}
        <motion.div
          className="absolute -top-28 -left-28 w-[360px] h-[360px] rounded-full bg-violet-400/10 blur-[80px] pointer-events-none"
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-[320px] h-[320px] rounded-full bg-pink-400/10 blur-[70px] pointer-events-none"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Form card */}
        <motion.div
          className="relative z-10 w-full max-w-[420px] mx-auto my-auto"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div
            className="border border-white/60 shadow-[0_24px_64px_rgba(0,0,0,0.09)] rounded-2xl overflow-hidden backdrop-blur-sm"
            style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(245,240,255,0.93) 100%)" }}
          >
            {/* Gradient accent bar — reversed */}
            <div className="h-1.5 bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />

            <div className="p-6">
              {/* Logo + nav */}
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-400 p-3 shadow-md"
                  animate={{
                    rotate: [0, 360],
                    borderRadius: ["12px", "50%", "50%", "12px"],
                  }}
                  transition={{
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    borderRadius: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <SparklesIcon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none">AI Voice</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assistant</p>
                </div>
                <div className="ml-auto text-xs text-slate-400">
                  Have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Join the AI assistant platform — it&apos;s free
                </p>
              </div>

              {/* OAuth */}
              <div className="space-y-2.5 mb-4">
                <motion.button
                  onClick={() => handleOAuth("google")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </motion.button>

                <motion.button
                  onClick={() => handleOAuth("github")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 border-2 border-slate-900 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 hover:border-slate-800 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </motion.button>
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 text-slate-400 font-medium" style={{ backgroundColor: "rgba(245,240,255,0.95)" }}>or register with email</span>
                </div>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full px-4 py-2.5 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full px-4 py-2.5 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      password === confirmPassword ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        password === confirmPassword ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </motion.div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden py-3 rounded-xl text-sm font-bold text-white shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)" }}
                  whileHover={{ scale: loading ? 1 : 1.01, boxShadow: "0 8px 30px rgba(139,92,246,0.35)" }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                  />
                  <span className="relative z-10">{loading ? "Creating account..." : "Create Account →"}</span>
                </motion.button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <motion.div
            className="flex justify-center gap-6 mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {["Free forever", "Secure auth", "AI-powered"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

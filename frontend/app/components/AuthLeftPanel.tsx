"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
import voiceAnimationData from "../lib/voice-animation.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const PARTICLES = [
  { x: 8,  y: 12, size: 3, color: "#06B6D4" },
  { x: 22, y: 72, size: 2, color: "#8B5CF6" },
  { x: 82, y: 18, size: 4, color: "#EC4899" },
  { x: 68, y: 82, size: 2, color: "#06B6D4" },
  { x: 44, y: 48, size: 3, color: "#8B5CF6" },
  { x: 91, y: 58, size: 2, color: "#EC4899" },
  { x: 14, y: 88, size: 3, color: "#06B6D4" },
  { x: 62, y: 8,  size: 2, color: "#A855F7" },
  { x: 33, y: 63, size: 4, color: "#EC4899" },
  { x: 76, y: 38, size: 2, color: "#06B6D4" },
  { x: 5,  y: 52, size: 3, color: "#8B5CF6" },
  { x: 52, y: 88, size: 2, color: "#EC4899" },
  { x: 88, y: 92, size: 3, color: "#A855F7" },
  { x: 18, y: 35, size: 2, color: "#06B6D4" },
  { x: 72, y: 62, size: 3, color: "#8B5CF6" },
];

// Spring-like fall ease
const FALL: [number, number, number, number] = [0.22, 1.2, 0.36, 1];

export function AuthLeftPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Dual rotating rings
      gsap.to(".ring-outer", {
        rotation: 360, duration: 30, repeat: -1, ease: "none", transformOrigin: "center center",
      });
      gsap.to(".ring-inner", {
        rotation: -360, duration: 20, repeat: -1, ease: "none", transformOrigin: "center center",
      });

      // Floating particles
      containerRef.current!.querySelectorAll(".particle").forEach((p, i) => {
        gsap.to(p, {
          y: i % 2 === 0 ? -20 : 20,
          x: i % 3 === 0 ? -12 : 12,
          opacity: 0.65,
          duration: 3 + (i % 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.25,
        });
      });

      // Animated stat counters
      [
        { ref: stat1Ref, target: 99, delay: 1.5 },
        { ref: stat2Ref, target: 50, delay: 1.8 },
        { ref: stat3Ref, target: 10, delay: 2.1 },
      ].forEach(({ ref, target, delay }) => {
        const obj = { count: 0 };
        gsap.to(obj, {
          count: target,
          duration: 2.2,
          delay,
          ease: "power2.out",
          onUpdate() {
            if (ref.current) ref.current.textContent = Math.round(obj.count).toString();
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="hidden lg:flex flex-col items-center justify-center w-[40%] h-screen relative overflow-hidden px-8 py-8 select-none"
      style={{ background: "linear-gradient(135deg, #030712 0%, #0a0a20 45%, #050917 100%)" }}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.3,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
        />
      ))}

      {/* ── Rotating rings ── */}
      <div
        className="ring-outer absolute rounded-full pointer-events-none"
        style={{
          width: 520, height: 520,
          top: "50%", left: "50%",
          marginTop: -260, marginLeft: -260,
          border: "1px dashed rgba(139, 92, 246, 0.14)",
        }}
      />
      <div
        className="ring-inner absolute rounded-full pointer-events-none"
        style={{
          width: 360, height: 360,
          top: "50%", left: "50%",
          marginTop: -180, marginLeft: -180,
          border: "1px dashed rgba(6, 182, 212, 0.12)",
        }}
      />

      {/* ── Background glow orbs ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 380, height: 380,
          top: "-80px", left: "-80px",
          background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320, height: 320,
          bottom: "-60px", right: "-60px",
          background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">

        {/* Live badge */}
        <motion.div
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <span
            className="w-2 h-2 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px #34d399", animation: "pulse 2s infinite" }}
          />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(148,163,184,0.85)" }}>
            Next-Gen AI Platform
          </span>
        </motion.div>

        {/* ═══ BIG GRADIENT TEXT — falls from top ═══ */}
        {/* "AI" */}
        <motion.h1
          className="font-black leading-[0.9] tracking-tight"
          style={{
            fontSize: "clamp(5rem, 8.5vw, 7.5rem)",
            background: "linear-gradient(90deg, #67e8f9 0%, #38bdf8 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.88, delay: 0.18, ease: FALL }}
        >
          AI
        </motion.h1>

        {/* "VOICE" */}
        <motion.h1
          className="font-black leading-[0.9] tracking-tight -mt-1"
          style={{
            fontSize: "clamp(5rem, 8.5vw, 7.5rem)",
            background: "linear-gradient(90deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.88, delay: 0.32, ease: FALL }}
        >
          VOICE
        </motion.h1>

        {/* "AGENT" — shimmer gradient via CSS keyframe */}
        <motion.h2
          className="font-black leading-[1] tracking-[0.1em] animate-gradient-shimmer"
          style={{
            fontSize: "clamp(2.8rem, 5.2vw, 4.2rem)",
            background: "linear-gradient(90deg, #fda4af, #fb7185, #fdba74, #fde68a, #fda4af)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
          initial={{ y: -65, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.88, delay: 0.46, ease: FALL }}
        >
          AGENT
        </motion.h2>

        {/* Subheading */}
        <motion.p
          className="mt-5 max-w-[270px] leading-relaxed text-[0.92rem]"
          style={{ color: "rgba(148,163,184,0.8)" }}
          initial={{ y: -45, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.62, ease: "easeOut" }}
        >
          Speak freely. Understand everything.{" "}
          <span style={{ color: "#67e8f9", fontWeight: 600 }}>Powered by AI</span>
          {" "}that actually listens.
        </motion.p>

        {/* ── Lottie voice waveform ── */}
        <motion.div
          className="mt-5 w-full relative"
          style={{ maxWidth: 340 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139,92,246,0.16) 0%, transparent 70%)",
              filter: "blur(18px)",
            }}
          />
          <Lottie
            animationData={voiceAnimationData}
            loop
            autoplay
            style={{ width: "100%", height: 120 }}
          />
        </motion.div>

        {/* ── Animated counters ── */}
        <motion.div
          className="flex gap-9 mt-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
        >
          {[
            { ref: stat1Ref, suffix: "%",  label: "Accuracy",  color: "#67e8f9" },
            { ref: stat2Ref, suffix: "ms", label: "Response",  color: "#a78bfa" },
            { ref: stat3Ref, suffix: "+",  label: "Languages", color: "#f472b6" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-2xl font-black tabular-nums"
                style={{ color: s.color, textShadow: `0 0 18px ${s.color}55` }}
              >
                <span ref={s.ref}>0</span>{s.suffix}
              </div>
              <div className="text-[11px] mt-0.5 font-medium tracking-wide" style={{ color: "rgba(148,163,184,0.5)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Feature chips ── */}
        <motion.div
          className="flex gap-2 mt-4 flex-wrap justify-center"
          style={{ maxWidth: 320 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.25 }}
        >
          {["Voice AI", "Real-time", "Multilingual", "GPT-powered"].map((chip, i) => (
            <motion.span
              key={chip}
              className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(203,213,225,0.8)",
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.25 + i * 0.09 }}
              whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.09)" }}
            >
              {chip}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

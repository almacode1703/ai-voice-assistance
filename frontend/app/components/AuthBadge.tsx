"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";

export default function AuthBadge() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide on auth pages
  if (pathname.startsWith("/auth")) return null;
  if (status === "loading") return null;
  if (!session?.user) return null;

  const initials = (session.user.name ?? session.user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.button
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover"
            style={{ boxShadow: "0 4px 18px rgba(139, 92, 246, 0.45), 0 1px 4px rgba(0,0,0,0.12)" }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 via-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold select-none"
            style={{ boxShadow: "0 4px 18px rgba(139, 92, 246, 0.45), 0 1px 4px rgba(0,0,0,0.12)" }}
          >
            {initials}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-200/80 shadow-2xl rounded-xl overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {session.user.name ?? "User"}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {session.user.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close */}
      {open && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

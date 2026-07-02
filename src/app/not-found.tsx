"use client";

import { motion } from "framer-motion";
import { Crown, ArrowLeft, Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-gold/20 bg-gold/10"
        >
          <Frown size={48} className="text-gold" />
        </motion.div>

        {/* 404 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-8xl font-black text-gold-gradient sm:text-9xl"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-xl font-bold text-white sm:text-2xl"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-3 max-w-md text-sm text-gray-500"
        >
          The page you seek has been lost in the void. Perhaps it was never forged, or perhaps it has been consumed by the anti-cheat gods.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (window.location.href = "/")}
            className="btn-gold flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Return Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (window.location.href = "/#products")}
            className="btn-outline-gold flex items-center gap-2"
          >
            <Crown size={16} />
            Browse Armory
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

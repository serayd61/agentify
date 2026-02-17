"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function AIAvatar({
  isThinking,
  isSpeaking,
}: {
  isThinking: boolean;
  isSpeaking: boolean;
}) {
  return (
    <div className="relative w-20 h-20">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff3b30] via-[#ff6b5e] to-[#ff9500]"
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : isThinking ? [1, 1.05, 1] : 1,
          boxShadow: isSpeaking
            ? [
                "0 0 20px rgba(255,59,48,0.5)",
                "0 0 40px rgba(255,59,48,0.8)",
                "0 0 20px rgba(255,59,48,0.5)",
              ]
            : "0 0 20px rgba(255,59,48,0.3)",
        }}
        transition={{ duration: isSpeaking ? 0.5 : 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex gap-3"
          animate={{ y: isThinking ? [0, -2, 0] : 0 }}
          transition={{ duration: 0.5, repeat: isThinking ? Infinity : 0 }}
        >
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{ scaleY: isSpeaking ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{ scaleY: isSpeaking ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0, delay: 0.1 }}
          />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isThinking && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [-10, -20], x: [5, 10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-2 h-2 bg-[#ff3b30] rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [-15, -25], x: [-5, -10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              className="absolute -top-1 -left-2 w-1.5 h-1.5 bg-[#ff6b5e] rounded-full"
            />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-[#ff3b30] rounded-full"
                animate={{ height: [8, 16, 8] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

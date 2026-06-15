"use client";

import { Loader2, Upload, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "./TaskContext";

export function TaskStatus() {
  const { tasks } = useTasks();

  return (
    <AnimatePresence>
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-16 left-1/2 z-[60] w-full max-w-[400px] -translate-x-1/2 px-4"
        >
          <div className="flex flex-col gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/95 px-4 py-3 shadow-lg backdrop-blur-xl">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                  {task.type === "upload" ? (
                    <Upload className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  )}
                </div>
                <span className="flex-1 truncate text-xs text-[var(--color-text-primary)]">
                  {task.label}
                </span>
                <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-[var(--color-accent)]" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

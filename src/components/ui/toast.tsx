/**
 * Toast Component
 * 
 * Toast notification system with different variants.
 * 
 * Usage:
 * ```tsx
 * import { useToast } from "@/hooks/useToast";
 * 
 * const { toast } = useToast();
 * 
 * // Show success toast
 * toast({
 *   title: "Success!",
 *   description: "Your changes have been saved.",
 *   variant: "success"
 * });
 * ```
 */

"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider
 * Wrap your app with this provider to use toast notifications
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * Use this hook to show toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return {
    toast: context.addToast,
    toasts: context.toasts,
    removeToast: context.removeToast,
  };
}

/**
 * Toast Container
 * Renders all active toasts
 */
interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Toast Component
 */
interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const variants = {
    success: {
      bg: "bg-[#34c759]/10",
      border: "border-[#34c759]/30",
      icon: <CheckCircle2 className="w-5 h-5 text-[#34c759]" />,
    },
    error: {
      bg: "bg-[#ff3b30]/10",
      border: "border-[#ff3b30]/30",
      icon: <XCircle className="w-5 h-5 text-[#ff3b30]" />,
    },
    warning: {
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/30",
      icon: <AlertCircle className="w-5 h-5 text-[#f59e0b]" />,
    },
    info: {
      bg: "bg-[#3b82f6]/10",
      border: "border-[#3b82f6]/30",
      icon: <Info className="w-5 h-5 text-[#3b82f6]" />,
    },
    default: {
      bg: "bg-white/10",
      border: "border-white/20",
      icon: <Info className="w-5 h-5 text-white/70" />,
    },
  };

  const variant = variants[toast.variant || "default"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 10, x: 400 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className={`${variant.bg} ${variant.border} border rounded-lg p-4 backdrop-blur-sm flex gap-3 pointer-events-auto`}
    >
      <div className="shrink-0 mt-0.5">
        {variant.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-white/70 mt-1">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

"use client";

import { ToastProvider } from "@/components/ui/toast";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

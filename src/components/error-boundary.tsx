/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors and displays fallback UI.
 * Helps prevent entire app from crashing.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */

"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="p-6 bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-xl text-center">
                <div className="w-14 h-14 rounded-full bg-[#ff3b30]/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-[#ff3b30]" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Etwas ist schief gelaufen</h2>
                <p className="text-sm text-white/60 mb-6">
                  Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
                </p>
                {process.env.NODE_ENV === "development" && (
                  <details className="text-left mb-4 p-3 bg-black/30 rounded border border-white/10">
                    <summary className="text-xs text-white/50 cursor-pointer mb-2">
                      Fehlerdetails
                    </summary>
                    <p className="text-xs text-white/40 font-mono break-words">
                      {this.state.error?.message}
                    </p>
                  </details>
                )}
                <Button
                  className="w-full"
                  onClick={this.reset}
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

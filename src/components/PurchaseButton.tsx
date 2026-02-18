"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  packageId: string;
  sectorId: string;
  billingCycle: "monthly" | "yearly";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function PurchaseButton({ packageId, sectorId, billingCycle, className, disabled, children }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, sectorId, billingCycle }),
      });

      const payload = await response.json();
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      if (response.status === 401 || payload.error?.toLowerCase().includes("nicht angemeldet")) {
        router.push(`/login?redirect=/pricing`);
        return;
      }

      alert(`Checkout fehlgeschlagen: ${payload.error ?? "Bitte versuchen Sie es erneut."}`);
    } catch (error) {
      console.error("Checkout request failed", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading || disabled} className={`${className} ${loading || disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

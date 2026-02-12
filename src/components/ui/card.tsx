"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  premium?: boolean;
  glow?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, premium = false, glow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 overflow-hidden",
        "bg-gradient-to-b from-white/[0.03] to-transparent",
        "bg-[#12121c] border border-white/[0.08]",
        hover && [
          "hover:border-white/[0.15]",
          "hover:-translate-y-1",
          "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
          "cursor-pointer",
        ],
        premium && [
          "bg-gradient-to-br from-[rgba(255,59,48,0.08)] to-transparent",
          "border-[rgba(255,59,48,0.2)]",
          "hover:border-[rgba(255,59,48,0.4)]",
          "hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(255,59,48,0.3)]",
        ],
        glow && "hover:shadow-[0_0_60px_-20px_rgba(255,59,48,0.4)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-bold tracking-tight text-white font-[family-name:var(--font-display)]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-white/60", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

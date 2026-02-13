/**
 * Skeleton Component
 * 
 * Placeholder component for loading states.
 * Shows shimmer animation while content is loading.
 * 
 * Usage:
 * ```tsx
 * <Skeleton className="w-full h-12" />
 * ```
 */

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({
  className,
  rounded = "md",
  ...props
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse",
        roundedClasses[rounded],
        className
      )}
      {...props}
    />
  );
}

/**
 * Card Skeleton
 * Skeleton for card layouts
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/**
 * List Skeleton
 * Skeleton for list items
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 * Skeleton for table layouts
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 border border-white/5 rounded-lg overflow-hidden">
      <div className="bg-white/[0.02] p-4 flex gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4 border-t border-white/5">
          {[...Array(4)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

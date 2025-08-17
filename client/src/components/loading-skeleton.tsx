import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 8 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="loading-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-dark-border animate-pulse"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 mb-2" />
              <Skeleton className="h-3 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

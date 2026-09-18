import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-subtle space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-5 rounded-lg" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg" />
      <Skeleton className="w-full h-4 rounded-md" />
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="w-20 h-4 rounded-md" />
        <Skeleton className="w-16 h-8 rounded-xl" />
      </div>
    </div>
  );
};

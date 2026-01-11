import React from 'react';

export const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl flex flex-col h-full overflow-hidden border border-gray-100 shadow-sm">
    <div className="relative aspect-[4/3] m-2 rounded-2xl bg-gray-100 animate-pulse" />
    <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-12" />
      </div>
      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      <div className="mt-2 h-8 bg-gray-100 rounded animate-pulse w-1/3" />
      <div className="mt-4 h-10 bg-gray-100 rounded-full animate-pulse w-full" />
    </div>
  </div>
);


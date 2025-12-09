"use client";

import useSearchState from "./useSearchState";
import SearchPill from "./SearchPill";
import SearchCompact from "./SearchCompact";

export default function AnimatedSearch({ initialArea = "", onSearch }) {
  const { area, setArea, isCompact } = useSearchState(initialArea);

  return (
    <div className="relative">
      {/* Big version */}
      <div
        className={`
          transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          ${isCompact ? "opacity-0 scale-95 -translate-y-4 pointer-events-none" : "opacity-100 scale-100"}
        `}
      >
        <SearchPill area={area} setArea={setArea} onSearch={onSearch} />
      </div>

      {/* Compact version */}
      <div
        className={`
          fixed left-1/2 -translate-x-1/2 
          transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          z-40
          ${isCompact ? "opacity-100 scale-100 top-[92px]" : "opacity-0 scale-95 -top-10 pointer-events-none"}
        `}
      >
        <SearchCompact area={area} setArea={setArea} onSearch={onSearch} />
      </div>
    </div>
  );
}

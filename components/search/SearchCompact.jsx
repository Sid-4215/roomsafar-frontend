"use client";

import { FiSearch } from "react-icons/fi";

export default function SearchCompact({ area, setArea, onSearch }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(area);
      }}
      className="
        bg-white shadow-md
        px-5 py-2.5
        rounded-full border border-slate-200
        w-[90vw] max-w-xl
        flex items-center gap-3
      "
    >
      <FiSearch className="text-slate-500" />

      <input
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Search rooms…"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
    </form>
  );
}

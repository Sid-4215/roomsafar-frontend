"use client";

import { FiSearch } from "react-icons/fi";

export default function SearchPill({ area, setArea, onSearch }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(area);
      }}
      className="
        w-full max-w-lg sm:max-w-2xl mx-auto
        bg-white rounded-full shadow-xl
        px-4 sm:px-6 py-3.5
        flex items-center justify-between
        border border-slate-200
      "
    >
      <input
        className="flex-1 bg-transparent outline-none text-slate-600 text-sm"
        placeholder="Search area, landmark..."
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />

      <button className="p-3 rounded-full bg-blue-600 text-white">
        <FiSearch size={18} />
      </button>
    </form>
  );
}

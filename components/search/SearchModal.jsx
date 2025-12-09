"use client";

import { FiX, FiMapPin } from "react-icons/fi";

export default function SearchModal({ open, area, setArea, onApply }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[999] flex justify-center items-start pt-32 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Search</h2>
          <button className="p-2 hover:bg-slate-100 rounded-full" onClick={onApply}>
            <FiX size={20} />
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="text-sm font-medium">Where</label>
          <div className="relative mt-2">
            <FiMapPin className="text-slate-400 absolute left-3 top-3" />
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area, landmark, locality..."
              className="w-full px-10 py-3 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <button
          onClick={onApply}
          className="
            mt-6 w-full py-3 rounded-xl
            bg-gradient-to-r from-blue-600 to-indigo-600
            text-white font-semibold text-sm shadow-lg
          "
        >
          Apply Search
        </button>
      </div>
    </div>
  );
}

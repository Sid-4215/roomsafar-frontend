"use client";

import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiHome, FiUsers, FiDollarSign } from "react-icons/fi";

const DEFAULT_FILTERS = {
  area: "",
  type: "",
  gender: "",
  maxRent: 15000,
};

export default function FilterModal({
  open,
  onClose,
  initialFilters = {},
  onApply,
}) {
  const [local, setLocal] = useState({ ...DEFAULT_FILTERS });

  useEffect(() => {
    if (open) {
      setLocal((prev) => ({
        ...prev,
        ...DEFAULT_FILTERS,
        ...initialFilters,
      }));
    }
  }, [open, initialFilters]);

  if (!open) return null;

  const update = (name, value) => {
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply?.(local);
    onClose?.();
  };

  const handleReset = () => {
    const cleared = { ...DEFAULT_FILTERS, area: local.area || "" };
    setLocal(cleared);
    onApply?.(cleared);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="
          w-full max-w-3xl
          bg-white rounded-3xl
          shadow-2xl
          p-6 sm:p-8
          animate-fadeIn
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Filters
            </h2>
            <p className="text-sm text-slate-500">
              Refine your search by room type, price and more
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <FiX size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Area (optional override) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FiMapPin className="text-slate-400" />
              Area (optional)
            </label>
            <input
              value={local.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="Hinjewadi, Kharadi, Baner..."
              className="
                w-full px-4 py-3 rounded-xl
                border border-slate-200
                bg-white
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-blue-100
                focus:border-blue-500
              "
            />
          </div>

          {/* Grid of filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FiHome className="text-slate-400" />
                Room type
              </label>
              <select
                value={local.type}
                onChange={(e) => update("type", e.target.value)}
                className="
                  w-full px-4 py-3 text-sm rounded-xl
                  border border-slate-200 bg-white
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-100
                  focus:border-blue-500
                "
              >
                <option value="">All types</option>
                <option value="RK">1 RK</option>
                <option value="BHK1">1 BHK</option>
                <option value="BHK2">2 BHK</option>
                <option value="SHARED">Shared Room</option>
                <option value="PG">PG</option>
              </select>
            </div>

            {/* Preferred For */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FiUsers className="text-slate-400" />
                Preferred for
              </label>
              <select
                value={local.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="
                  w-full px-4 py-3 text-sm rounded-xl
                  border border-slate-200 bg-white
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-100
                  focus:border-blue-500
                "
              >
                <option value="">Anyone</option>
                <option value="BOYS">Boys Only</option>
                <option value="GIRLS">Girls Only</option>
                <option value="PROFESSIONALS">Professionals</option>
                <option value="STUDENTS">Students</option>
              </select>
            </div>
          </div>

          {/* Max Rent slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FiDollarSign className="text-slate-400" />
                Max rent per month
              </span>
              <span className="text-base font-semibold text-blue-600">
                ₹{local.maxRent.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={30000}
              step={500}
              value={local.maxRent}
              onChange={(e) => update("maxRent", Number(e.target.value))}
              className="
                w-full h-2 rounded-full bg-slate-200
                appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-blue-600
                [&::-webkit-slider-thumb]:border-4
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-lg
              "
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>₹3k</span>
              <span>₹30k</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="
              px-4 py-2.5 text-sm font-medium
              rounded-xl border border-slate-200
              text-slate-700 hover:bg-slate-50
              transition
            "
          >
            Clear all
          </button>

          <button
            onClick={handleApply}
            className="
              px-6 py-2.5 text-sm font-medium
              rounded-xl
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white shadow-md hover:shadow-lg
              hover:from-blue-700 hover:to-indigo-700
              transition
            "
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}

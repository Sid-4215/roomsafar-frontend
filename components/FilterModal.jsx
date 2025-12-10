"use client";

import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiHome, FiUsers, FiDollarSign, FiCalendar } from "react-icons/fi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DEFAULT_FILTERS = {
  area: "",
  type: "",
  gender: "",
  maxRent: 15000,
  createdOn: "",
  startDate: "",
  endDate: "",
};

export default function FilterModal({
  open,
  onClose,
  initialFilters = {},
  onApply,
}) {
  const [local, setLocal] = useState({ ...DEFAULT_FILTERS });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState("single"); // single | range

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

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

  const applySingleDate = (date) => {
    update("createdOn", date.toISOString().split("T")[0]);
    update("startDate", "");
    update("endDate", "");
    setShowCalendar(false);
  };

  const applyRange = () => {
    const start = range[0].startDate.toISOString().split("T")[0];
    const end = range[0].endDate.toISOString().split("T")[0];

    update("startDate", start);
    update("endDate", end);
    update("createdOn", "");

    setShowCalendar(false);
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
          relative
        "
      >
        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute z-50 top-20 right-6 bg-white shadow-xl p-4 rounded-xl border">
            {calendarMode === "single" ? (
              <DateRange
                onChange={(item) => applySingleDate(item.selection.startDate)}
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: "selection",
                  },
                ]}
                showSelectionPreview={false}
                months={1}
                direction="horizontal"
              />
            ) : (
              <>
                <DateRange
                  onChange={(item) => setRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                  months={1}
                  direction="horizontal"
                />

                <button
                  onClick={applyRange}
                  className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg"
                >
                  Apply Range
                </button>
              </>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
            <p className="text-sm text-slate-500">Refine your search</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <FiX size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Area */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <FiMapPin className="text-slate-400" /> Area
          </label>

          <input
            value={local.area}
            onChange={(e) => update("area", e.target.value)}
            placeholder="Hinjewadi, Baner, Kharadi..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
          />
        </div>

        {/* Room Type & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FiHome className="text-slate-400" /> Room type
            </label>

            <select
              value={local.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All types</option>
              <option value="RK">1 RK</option>
              <option value="BHK1">1 BHK</option>
              <option value="BHK2">2 BHK</option>
              <option value="SHARED">Shared</option>
              <option value="PG">PG</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FiUsers className="text-slate-400" /> Preferred For
            </label>
            <select
              value={local.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Anyone</option>
              <option value="BOYS">Boys</option>
              <option value="GIRLS">Girls</option>
              <option value="PROFESSIONALS">Professionals</option>
              <option value="STUDENTS">Students</option>
            </select>
          </div>
        </div>

        {/* Max Rent */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FiDollarSign /> Max Rent
            </span>
            <span className="text-blue-600 font-semibold">₹{local.maxRent}</span>
          </div>

          <input
            type="range"
            min={3000}
            max={30000}
            step={500}
            value={local.maxRent}
            onChange={(e) => update("maxRent", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* DATE FILTERS */}
        <div className="space-y-4 mb-6">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiCalendar /> Date Filter
          </label>

          <div className="flex flex-col gap-3">

            <button
              className="px-4 py-3 rounded-xl border border-slate-200 flex justify-between"
              onClick={() => {
                setCalendarMode("single");
                setShowCalendar(true);
              }}
            >
              Created On: {local.createdOn || "Select date"}
            </button>

            <button
              className="px-4 py-3 rounded-xl border border-slate-200 flex justify-between"
              onClick={() => {
                setCalendarMode("range");
                setShowCalendar(true);
              }}
            >
              Date Range:{" "}
              {local.startDate && local.endDate
                ? `${local.startDate} → ${local.endDate}`
                : "Select range"}
            </button>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded-xl"
          >
            Clear All
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

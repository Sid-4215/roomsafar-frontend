import { useState } from "react";

export default function Filters({ onApply }) {
  const [filters, setFilters] = useState({
    maxRent: 15000,
    area: "",
    type: "",
    gender: "",
  });

  const update = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onApply(updated);
  };

  const reset = () => {
    const cleared = { maxRent: 15000, area: "", type: "", gender: "" };
    setFilters(cleared);
    onApply(cleared);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 w-full">

      {/* ⭐ MAX RENT SLIDER */}
      <div className="flex flex-col w-48">
        <label className="text-xs font-semibold text-slate-600">
          Max Rent: <span className="font-bold">₹{filters.maxRent.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min="3000"
          max="30000"
          step="500"
          value={filters.maxRent}
          onChange={(e) => update("maxRent", Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* AREA */}
      <select
        value={filters.area}
        onChange={(e) => update("area", e.target.value)}
        className="px-4 py-2 text-sm rounded-full border border-slate-300 bg-slate-50 hover:bg-white transition"
      >
        <option value="">Area</option>
        <option value="Hinjewadi">Hinjewadi</option>
        <option value="Kharadi">Kharadi</option>
        <option value="Baner">Baner</option>
        <option value="Wakad">Wakad</option>
      </select>

      {/* TYPE */}
      <select
        value={filters.type}
        onChange={(e) => update("type", e.target.value)}
        className="px-4 py-2 text-sm rounded-full border border-slate-300 bg-slate-50 hover:bg-white transition"
      >
        <option value="">Type</option>
        <option value="RK">1 RK</option>
        <option value="BHK1">1 BHK</option>
        <option value="SHARED">Shared</option>
      </select>

      {/* GENDER */}
      <select
        value={filters.gender}
        onChange={(e) => update("gender", e.target.value)}
        className="px-4 py-2 text-sm rounded-full border border-slate-300 bg-slate-50 hover:bg-white transition"
      >
        <option value="">Anyone</option>
        <option value="BOYS">Boys</option>
        <option value="GIRLS">Girls</option>
      </select>

      {/* RESET */}
      <button
        onClick={reset}
        className="ml-auto px-4 py-2 text-xs rounded-full border border-slate-300 bg-white hover:bg-slate-100 transition"
      >
        Reset
      </button>
    </div>
  );
}

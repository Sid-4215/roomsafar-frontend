import { useState, useCallback } from "react";
import {
  FiMapPin,
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiSliders,
} from "react-icons/fi";

import Filters from "./Filters";

export default function SearchBar({ onSearch }) {
  const [filters, setFilters] = useState({
    area: "",
    type: "",
    gender: "",
    maxRent: "",
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const applySearch = useCallback(() => {
    onSearch?.(filters);
    setMobileFiltersOpen(false);
  }, [filters, onSearch]);

  const clear = () => {
    const cleared = { area: "", type: "", gender: "", maxRent: "" };
    setFilters(cleared);
    onSearch?.(cleared);
  };

  return (
    <>
      {/* ------------------- SEARCH BAR ------------------- */}
      <div className="w-full bg-white border border-slate-200 rounded-full shadow-sm px-4 py-3 flex items-center gap-3">

        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <FiMapPin
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search area, location..."
              value={filters.area}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, area: e.target.value }))
              }
              className="w-full pl-10 pr-3 py-2 text-sm bg-white rounded-full outline-none"
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
          </div>
        </div>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden bg-slate-100 rounded-full p-2 hover:bg-slate-200"
        >
          <FiSliders size={18} />
        </button>

        {/* SEARCH BUTTON */}
        <button
          onClick={applySearch}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-3 hover:brightness-110"
        >
          <FiSearch size={18} />
        </button>
      </div>

      {/* ------------------- DESKTOP FILTERS ------------------- */}
      <div className="hidden lg:block mt-3">
        <div className="flex items-center gap-3 flex-wrap">

          <FilterSelect
            icon={<FiHome size={16} />}
            options={[
              { label: "Any type", value: "" },
              { label: "1 RK", value: "RK" },
              { label: "1 BHK", value: "BHK1" },
              { label: "Shared", value: "SHARED" },
            ]}
            value={filters.type}
            setValue={(v) => setFilters({ ...filters, type: v })}
          />

          <FilterSelect
            icon={<FiUsers size={16} />}
            options={[
              { label: "Anyone", value: "" },
              { label: "Boys only", value: "BOYS" },
              { label: "Girls only", value: "GIRLS" },
            ]}
            value={filters.gender}
            setValue={(v) => setFilters({ ...filters, gender: v })}
          />

          <FilterSelect
            icon={<FiDollarSign size={16} />}
            options={[
              { label: "Any price", value: "" },
              { label: "Under ₹5k", value: "5000" },
              { label: "Under ₹10k", value: "10000" },
              { label: "Under ₹20k", value: "20000" },
            ]}
            value={filters.maxRent}
            setValue={(v) => setFilters({ ...filters, maxRent: v })}
          />

          <button
            onClick={clear}
            className="px-4 py-2 text-sm border rounded-full hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ------------------- MOBILE FILTER PANEL ------------------- */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slideUp">

            <Filters onApply={setFilters} />

            {/* Close Button */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="px-4 py-2 bg-slate-200 rounded-full"
              >
                Close
              </button>

              <button
                onClick={applySearch}
                className="px-6 py-2 rounded-full bg-blue-600 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* REUSABLE SELECT COMPONENT */
function FilterSelect({ icon, value, setValue, options }) {
  return (
    <div className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2 bg-white hover:border-blue-300 transition">
      <span className="text-slate-400">{icon}</span>
      <select
        className="bg-transparent text-sm outline-none cursor-pointer"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

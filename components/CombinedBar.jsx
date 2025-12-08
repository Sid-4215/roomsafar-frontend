import { useState, useCallback, useEffect } from "react";
import { FiSearch, FiSliders, FiChevronDown, FiX, FiMapPin } from "react-icons/fi";

export default function CombinedBar({ onSearch }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    area: "",
    type: "",
    gender: "",
    maxRent: 15000,
  });

  const applySearch = useCallback(() => {
    onSearch?.(filters);
    setShowFilters(false);
  }, [filters, onSearch]);

  const updateFilters = (updated) => {
    setFilters(updated);
    onSearch?.(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };

  return (
    <div className="w-full sticky top-20 z-40 px-4">
      {/* MAIN SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg px-6 py-4 flex items-center gap-4 hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto">
        {/* LOCATION INPUT */}
        <div className="flex-1 flex items-center gap-3">
          <FiMapPin className="text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Location
            </label>
            <input
              placeholder="Enter area, landmark or city..."
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full text-sm outline-none placeholder:text-slate-400"
              onFocus={() => setShowFilters(false)}
            />
          </div>
        </div>

        <div className="hidden md:block h-8 w-px bg-slate-200"></div>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
        >
          <FiSliders size={16} className="text-slate-600 group-hover:text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
          <FiChevronDown 
            className={`transition-transform duration-200 ${showFilters ? "rotate-180 text-blue-600" : "text-slate-400"}`}
          />
        </button>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
        >
          <FiSliders size={18} className="text-slate-600" />
        </button>

        {/* SEARCH BUTTON */}
        <button
          onClick={applySearch}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FiSearch size={20} />
        </button>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[95vw] max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 animate-slideDown z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <FiX size={20} className="text-slate-500" />
            </button>
          </div>
          
          <Filters onApply={updateFilters} filters={filters} />
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setFilters({ area: "", type: "", gender: "", maxRent: 15000 })}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              Clear all
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={applySearch}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Filters({ onApply, filters }) {
  const update = (name, value) => {
    const updated = { ...filters, [name]: value };
    onApply(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* RENT SLIDER */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Max Rent</label>
          <span className="text-lg font-bold text-blue-600">₹{filters.maxRent.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="3000"
          max="30000"
          step="500"
          value={filters.maxRent}
          onChange={(e) => update("maxRent", Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>₹3k</span>
          <span>₹30k</span>
        </div>
      </div>

      {/* AREA SELECT */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Area</label>
        <select
          value={filters.area}
          onChange={(e) => update("area", e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        >
          <option value="">All Areas</option>
          <option value="Hinjewadi">Hinjewadi</option>
          <option value="Kharadi">Kharadi</option>
          <option value="Baner">Baner</option>
          <option value="Wakad">Wakad</option>
          <option value="Viman Nagar">Viman Nagar</option>
          <option value="Kothrud">Kothrud</option>
        </select>
      </div>

      {/* TYPE SELECT */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Room Type</label>
        <select
          value={filters.type}
          onChange={(e) => update("type", e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        >
          <option value="">All Types</option>
          <option value="RK">1 RK</option>
          <option value="BHK1">1 BHK</option>
          <option value="BHK2">2 BHK</option>
          <option value="SHARED">Shared Room</option>
          <option value="PG">PG</option>
        </select>
      </div>

      {/* GENDER SELECT */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Preferred For</label>
        <select
          value={filters.gender}
          onChange={(e) => update("gender", e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        >
          <option value="">Anyone</option>
          <option value="BOYS">Boys Only</option>
          <option value="GIRLS">Girls Only</option>
          <option value="PROFESSIONALS">Professionals</option>
          <option value="STUDENTS">Students</option>
        </select>
      </div>
    </div>
  );
}
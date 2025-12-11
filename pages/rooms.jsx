import { useState, useEffect, useCallback } from "react";
import SEO from "../components/SEO";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import RoomCard from "../components/room-ui/RoomCard";
import Footer from "../components/Footer";
import AnimatedSearch from "../components/search/AnimatedSearch";
import FilterModal from "../components/FilterModal.jsx";
import { roomsAPI } from "../services/api";
import {
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function Rooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* 🌟 SEO */
  const areaSEO = filters.area ? ` in ${filters.area}` : "";
  const title = `Rooms${areaSEO} in Pune | Roomsafar`;
  const desc = `Browse verified rooms${areaSEO} in Pune. No brokerage, real photos, direct owner contact. Filters for rent, gender, furnishing, and more.`;

  /* 🚀 Fetch Rooms */
  const fetchRooms = useCallback(
    async (newFilters = {}, reset = false, newPage = 0) => {
      const currentFilters = { ...filters, ...newFilters };

      if (reset) {
        setLoading(true);
        setPage(0);
      } else if (newPage > 0) {
        setLoadingMore(true);
      }

      /* ⭐ FIXED SORTING LOGIC (100% correct) */
      let sortField = "createdAt";
      let sortDirection = "desc"; // newest first

      if (sortBy === "rent") {
        sortField = "rent";
        sortDirection = "asc"; // Low → High
      }

      if (sortBy === "rentDesc") {
        sortField = "rent";
        sortDirection = "desc"; // High → Low
      }

      const params = {
        page: reset ? 0 : newPage,
        size: 20,
        sortBy: sortField,
        sortDir: sortDirection,
        ...currentFilters,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      try {
        const data = await roomsAPI.searchRooms(params);

        let roomsArray = [];
        let total = 0;

        if (Array.isArray(data)) {
          roomsArray = data;
          total = data.length;
        } else if (data?.content) {
          roomsArray = data.content;
          total = data.totalElements || 0;
        }

        if (reset || newPage === 0) {
          setRooms(roomsArray);
        } else {
          setRooms((prev) => [...prev, ...roomsArray]);
        }

        setTotalResults(total);
        setHasMore(roomsArray.length === 20);
        setFilters(currentFilters);

        const queryParams = new URLSearchParams();
        Object.entries(currentFilters).forEach(([k, v]) => v && queryParams.set(k, v));
        window.history.replaceState({}, "", `/rooms?${queryParams.toString()}`);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load rooms.");
        setRooms([]);
        setTotalResults(0);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, sortBy]
  );

  /* Load filters from URL on mount */
  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    const processed = {};

    Object.entries(params).forEach(([key, value]) => {
      processed[key] =
        key === "maxRent" || key === "minRent" ? Number(value) : value;
    });

    setFilters(processed);
    fetchRooms(processed, true);
  }, []);

  const handleQuickSearch = (area) => {
    fetchRooms({ ...filters, area }, true);
  };

  const handleApplyFilters = (newFilters) => {
    fetchRooms(newFilters, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const next = page + 1;
      setPage(next);
      fetchRooms({}, false, next);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    fetchRooms({}, true);
  };

  /* ⭐ FINAL SORT OPTIONS — Area removed */
  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "rent", label: "Price: Low to High" },
    { value: "rentDesc", label: "Price: High to Low" },
  ];

  return (
    <>
      {/* SEO */}
      <SEO
        title={title}
        description={desc}
        url={`https://roomsafar.com${router.asPath}`}
      />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: title,
            url: `https://roomsafar.com${router.asPath}`,
            numberOfItems: totalResults,
          }),
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          <div className="sticky top-[88px] z-40 px-4">
            <AnimatedSearch
              initialArea={filters.area || ""}
              onSearch={handleQuickSearch}
            />
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Rooms{areaSEO} in Pune
              </h1>
              <p className="text-slate-600 mt-2">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <FiRefreshCw className="animate-spin" /> Loading rooms...
                  </span>
                ) : (
                  `Found ${totalResults.toLocaleString()} rooms`
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm hover:shadow transition"
              >
                <FiFilter size={16} className="text-slate-600" />
                Filters
              </button>

              {/* Grid/List Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiGrid size={20} />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiList size={20} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {loading && rooms.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-2xl h-56 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No rooms found
              </h3>
              <button
                onClick={() => fetchRooms({}, true)}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }`}
              >
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} viewMode={viewMode} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <FiLoader className="animate-spin" /> Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Average Response", value: "2.4 hrs" },
              { label: "Owner Verified", value: "98%" },
              { label: "Satisfaction", value: "4.8/5" },
              { label: "Instant Contact", value: "100%" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </main>

        <FilterModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          initialFilters={filters}
          onApply={handleApplyFilters}
        />

        <Footer />
      </div>
    </>
  );
}

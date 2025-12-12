import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoomCard from "../components/room-ui/RoomCard";
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

export default function Rooms({ initialRooms, initialTotal }) {
  const router = useRouter();

  const [rooms, setRooms] = useState(initialRooms);
  const [totalResults, setTotalResults] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialRooms.length === 20);

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);

  const areaSEO = filters.area ? ` in ${filters.area}` : "";
  const title = `Rooms${areaSEO} in Pune | Roomsafar`;
  const desc = `Browse verified rooms${areaSEO} in Pune. No brokerage, real photos, direct owner contact. Filters for rent, gender, furnishing, and more.`;

  // Fetch with filters after load
  const fetchRooms = useCallback(async (newFilters = {}, reset = false, newPage = 0) => {
    const merged = { ...filters, ...newFilters };

    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const sortField =
        sortBy === "rent" ? "rent" : sortBy === "rentDesc" ? "rent" : "createdAt";
      const sortDirection =
        sortBy === "rent" ? "asc" : sortBy === "rentDesc" ? "desc" : "desc";

      const params = {
        page: reset ? 0 : newPage,
        size: 20,
        sortBy: sortField,
        sortDir: sortDirection,
        ...merged,
      };

      const data = await roomsAPI.searchRooms(params);

      const newData = data?.content || [];

      if (reset) {
        setRooms(newData);
      } else {
        setRooms((prev) => [...prev, ...newData]);
      }

      setHasMore(newData.length === 20);
      setTotalResults(data.totalElements || 0);
      setFilters(merged);

      // Update URL params
      const queryParams = new URLSearchParams();
      Object.entries(merged).forEach(([k, v]) => v && queryParams.set(k, v));
      router.replace(`/rooms?${queryParams.toString()}`);

    } catch (err) {
      toast.error("Failed to load rooms.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, sortBy]);


  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href="https://roomsafar.com/rooms" />

        {/* OG */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roomsafar.com/rooms" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
          {/* Search */}
          <div className="sticky top-[88px] z-40 px-4">
            <AnimatedSearch
              initialArea={filters.area || ""}
              onSearch={(area) => fetchRooms({ area }, true)}
            />
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Rooms{areaSEO} in Pune
              </h1>
              <p className="text-slate-600 mt-2">
                Found {totalResults.toLocaleString()} rooms
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2"
              >
                <FiFilter /> Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  fetchRooms({}, true);
                }}
                className="px-4 py-2 bg-white border rounded-xl"
              >
                <option value="createdAt">Newest First</option>
                <option value="rent">Price: Low to High</option>
                <option value="rentDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Rooms */}
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} viewMode={viewMode} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchRooms({}, false, next);
                }}
                className="px-8 py-3 bg-white border rounded-xl"
              >
                {loadingMore ? <FiLoader className="animate-spin" /> : "Load More"}
              </button>
            </div>
          )}
        </main>

        <FilterModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          initialFilters={filters}
          onApply={(f) => fetchRooms(f, true)}
        />

        <Footer />
      </div>
    </>
  );
}

// SSR — initial list
export async function getServerSideProps() {
  try {
    const data = await roomsAPI.searchRooms({ page: 0, size: 20 });

    return {
      props: {
        initialRooms: data?.content || [],
        initialTotal: data?.totalElements || 0,
        disableDefaultSEO: true, // prevent SEO override
      },
    };
  } catch {
    return {
      props: {
        initialRooms: [],
        initialTotal: 0,
        disableDefaultSEO: true,
      },
    };
  }
}

import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoomCard from "../components/room-ui/RoomCard";
import AnimatedSearch from "../components/search/AnimatedSearch";
import RoomCardSkeleton from "../components/room-ui/RoomCardSkeleton";

import { roomsAPI } from "../services/api";

import { FiFilter, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

const DynamicFilterModal = dynamic(() => import("../components/FilterModal.jsx"), {
  ssr: false,
  loading: () => null,
});

export default function Rooms({ initialRooms, initialTotal }) {
  const router = useRouter();
  const loadMoreRef = useRef(null);

  const [rooms, setRooms] = useState(initialRooms);
  const [totalResults, setTotalResults] = useState(initialTotal);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialRooms.length === 20);

  const [sortBy, setSortBy] = useState(router.query.sort || "createdAt");
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const areaSEO = useMemo(() => (filters.area ? ` in ${filters.area}` : ""), [filters.area]);
  const title = `Rooms${areaSEO} in Pune | Roomsafar`;
  const desc = `Browse verified rooms${areaSEO}. No brokerage, real photos, owner contact.`;

  /* -------------------------------------------
   🔥 Correct Sorting Logic
  ------------------------------------------- */
  const getSortParams = useCallback((s) => {
    if (s === "rent") return { sortField: "rent", sortDirection: "ASC" };
    if (s === "rentDesc") return { sortField: "rent", sortDirection: "DESC" };
    return { sortField: "createdAt", sortDirection: "DESC" };
  }, []);

  /* -------------------------------------------
   🔥 Smooth, Optimized Fetch Function
  ------------------------------------------- */
  const fetchRooms = useCallback(
    async (newFilters = {}, reset = false, newPage = 0, newSortBy = sortBy) => {
      const merged = { ...filters, ...newFilters };
      const { sortField, sortDirection } = getSortParams(newSortBy);

      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      try {
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
          window.scrollTo({ top: 240, behavior: "smooth" });
        } else {
          setRooms((prev) => [...prev, ...newData]);
        }

        setHasMore(newData.length === 20);
        setTotalResults(data.totalElements || 0);
        setFilters(merged);

        // URL update
        const q = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
        q.set("sort", newSortBy);

        router.replace(`/rooms?${q.toString()}`);

      } catch (err) {
        toast.error("Failed to load rooms.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, sortBy, getSortParams, router]
  );

  /* -------------------------------------------
   🔥 Lag-Free Infinite Scroll
  ------------------------------------------- */
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const next = page + 1;
          setPage(next);

          // IMPORTANT FIX
          fetchRooms({}, false, next, sortBy);
        }
      },
      { rootMargin: "350px" }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => el && observer.unobserve(el);
  }, [hasMore, loadingMore, page, fetchRooms, sortBy]);


  /* -------------------------------------------
   🚀 Component Rendering
  ------------------------------------------- */
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href="https://roomsafar.com/rooms" />

        {/* Image optimization */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-2 sm:px-6 pt-6 pb-20">

          {/* Search Bar */}
          <div className="sticky top-[88px] z-40 w-full px-1 sm:px-4">
            <AnimatedSearch
              initialArea={filters.area || ""}
              onSearch={(area) => fetchRooms({ area }, true)}
            />
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
            <div>
              <h1 className="text-3xl font-bold">Rooms{areaSEO} in Pune</h1>
              <p className="text-slate-600">Found {totalResults.toLocaleString()} rooms</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2"
              >
                <FiFilter /> Filters
              </button>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  fetchRooms({}, true, 0, e.target.value);
                }}
                className="px-4 py-2 bg-white border rounded-xl"
              >
                <option value="createdAt">Newest First</option>
                <option value="rent">Price: Low to High</option>
                <option value="rentDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard key={`room-${room.id}`} room={room} />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="mt-12 text-center">
              <button className="px-8 py-3 bg-white border rounded-xl" disabled={loadingMore}>
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiLoader className="animate-spin" /> Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </main>

        {/* Modal */}
        <DynamicFilterModal
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

export async function getServerSideProps() {
  try {
    const data = await roomsAPI.searchRooms({ page: 0, size: 20 });

    return {
      props: {
        initialRooms: data?.content || [],
        initialTotal: data?.totalElements || 0,
      },
    };
  } catch {
    return {
      props: { initialRooms: [], initialTotal: 0 },
    };
  }
}

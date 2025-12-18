import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoomCard from "../components/room-ui/RoomCard";
import AnimatedSearch from "../components/search/AnimatedSearch";
import RoomCardSkeleton from "../components/room-ui/RoomCardSkeleton";

import { FiFilter, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

/* ---------------- Dynamic Imports ---------------- */
const DynamicFilterModal = dynamic(
  () => import("../components/FilterModal.jsx"),
  { ssr: false }
);

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/* ---------------- Page ---------------- */
export default function Rooms({ initialRooms, initialTotal }) {
  const router = useRouter();
  const loadMoreRef = useRef(null);
  const isInitialMount = useRef(true);
  const hasRestoredState = useRef(false);
  const lastSaveTime = useRef(Date.now());

  const [rooms, setRooms] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [sortBy, setSortBy] = useState(router.query.sort || "createdAt");
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ---------------- State Management ---------------- */
  const saveStateToStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Only save if we have rooms loaded
    if (rooms.length === 0) return;
    
    // Throttle saves to avoid performance issues
    const now = Date.now();
    if (now - lastSaveTime.current < 1000) return;
    lastSaveTime.current = now;
    
    try {
      const state = {
        rooms,
        totalResults,
        page,
        hasMore,
        sortBy,
        filters,
        timestamp: Date.now()
      };
      localStorage.setItem('roomsState', JSON.stringify(state));
      localStorage.setItem('roomsScrollPosition', window.scrollY.toString());
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }, [rooms, totalResults, page, hasMore, sortBy, filters]);

  const restoreStateFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const savedState = localStorage.getItem('roomsState');
      const savedScroll = localStorage.getItem('roomsScrollPosition');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const stateAge = Date.now() - parsedState.timestamp;
        
        // Only restore if state is less than 5 minutes old
        if (stateAge < 5 * 60 * 1000) {
          setRooms(parsedState.rooms || []);
          setTotalResults(parsedState.totalResults || 0);
          setPage(parsedState.page || 0);
          setHasMore(parsedState.hasMore || false);
          setSortBy(parsedState.sortBy || "createdAt");
          setFilters(parsedState.filters || {});
          hasRestoredState.current = true;
          
          // Restore scroll position after a short delay
          if (savedScroll) {
            setTimeout(() => {
              window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
            }, 100);
          }
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore state from localStorage:', error);
    }
    return false;
  }, []);

  /* ---------------- Initialize State ---------------- */
  useEffect(() => {
    if (isInitialMount.current) {
      const restored = restoreStateFromStorage();
      if (!restored) {
        // If no saved state, use initial props
        setRooms(initialRooms);
        setTotalResults(initialTotal);
        setHasMore(initialRooms.length === 20);
      }
      isInitialMount.current = false;
    }
  }, [initialRooms, initialTotal, restoreStateFromStorage]);

  /* ---------------- Auto-save State ---------------- */
  useEffect(() => {
    const debouncedSave = debounce(saveStateToStorage, 1000);
    debouncedSave();
  }, [rooms, totalResults, page, hasMore, sortBy, filters, saveStateToStorage]);

  /* ---------------- Handle Page Unload ---------------- */
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateToStorage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStateToStorage]);

  useEffect(() => {
  if (!router.isReady) return;

  const { area } = router.query;

  if (area) {
    fetchRooms({ area }, true);
  }
}, [router.isReady]);


  /* ---------------- SEO ---------------- */
  const areaSEO = useMemo(
    () => (filters.area ? ` in ${filters.area}` : ""),
    [filters.area]
  );

  const seoTitle = `Rooms${areaSEO} in Pune | Roomsafar`;
  const seoDesc = `Browse verified rooms${areaSEO} in Pune. No brokerage, real photos, direct owner contact.`;

  /* ---------------- Sorting ---------------- */
  const getSortParams = useCallback((s) => {
    if (s === "rent") return { sortField: "rent", sortDirection: "ASC" };
    if (s === "rentDesc") return { sortField: "rent", sortDirection: "DESC" };
    return { sortField: "createdAt", sortDirection: "DESC" };
  }, []);

  /* ---------------- Fetch Rooms ---------------- */
  const fetchRooms = useCallback(
    async (newFilters = {}, reset = false, newPage = 0, newSort = sortBy) => {
      const merged = { ...filters, ...newFilters };
      const { sortField, sortDirection } = getSortParams(newSort);

      reset ? setLoading(true) : setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: reset ? 0 : newPage,
          size: 20,
          sortBy: sortField,
          sortDir: sortDirection,
          ...merged,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/search?${params}`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        const newData = data?.content || [];

        reset
          ? setRooms(newData)
          : setRooms((prev) => [...prev, ...newData]);

        setHasMore(newData.length === 20);
        setTotalResults(data.totalElements || 0);
        setFilters(merged);

        const q = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
        q.set("sort", newSort);
        router.replace(`/rooms?${q.toString()}`, undefined, { shallow: true });

        if (reset) window.scrollTo({ top: 240, behavior: "smooth" });
      } catch {
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, sortBy, getSortParams, router]
  );

  /* ---------------- Infinite Scroll ---------------- */
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const next = page + 1;
          setPage(next);
          fetchRooms({}, false, next, sortBy);
        }
      },
      { rootMargin: "350px" }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, [hasMore, loadingMore, page, fetchRooms, sortBy]);

  /* ---------------- Handle Card Click ---------------- */
  const handleCardClick = useCallback((roomId) => {
    // Save current state before navigation
    saveStateToStorage();
    
    // Add a small delay to ensure state is saved
    setTimeout(() => {
      router.push(`/room/${roomId}`);
    }, 50);
  }, [router, saveStateToStorage]);

  /* ---------------- Handle Back Button ---------------- */
  useEffect(() => {
    const handlePopState = () => {
      // When back button is pressed, restore state
      setTimeout(() => {
        if (!hasRestoredState.current) {
          restoreStateFromStorage();
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restoreStateFromStorage]);

  /* ---------------- Clear Saved State on Manual Refresh ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If user presses F5 or Ctrl+R, clear saved state
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        localStorage.removeItem('roomsState');
        localStorage.removeItem('roomsScrollPosition');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <>
      {/* ================= SEO HEAD ================= */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href="https://roomsafar.com/rooms" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://roomsafar.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://roomsafar.com/rooms" />
        <meta property="og:site_name" content="Roomsafar" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://roomsafar.com/og-image.png" />

        {/* Image CDN */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-2 sm:px-6 pt-6 pb-20">
          {/* Search */}
          <div className="sticky top-[88px] z-40">
            <AnimatedSearch
              initialArea={filters.area || ""}
              onSearch={(area) => fetchRooms({ area }, true)}
            />
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 my-6">
            <div>
              <h1 className="text-3xl font-bold">
                Rooms{areaSEO} in Pune
              </h1>
              <p className="text-slate-600">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div key={room.id} onClick={() => handleCardClick(room.id)}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div ref={loadMoreRef} className="mt-12 text-center">
              <button className="px-8 py-3 bg-white border rounded-xl">
                {loadingMore ? (
                  <span className="flex items-center gap-2 justify-center">
                    <FiLoader className="animate-spin" /> Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </main>

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

/* ---------------- SSR (CRITICAL) ---------------- */
export async function getServerSideProps() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/search?page=0&size=20`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();

    return {
      props: {
        initialRooms: data.content || [],
        initialTotal: data.totalElements || 0,
      },
    };
  } catch {
    return {
      props: { initialRooms: [], initialTotal: 0 },
    };
  }
}

Rooms.disableDefaultSEO = true;
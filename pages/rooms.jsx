import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import RoomCard from "../components/RoomCard";
import CombinedBar from "../components/CombinedBar";
import Footer from "../components/Footer";
import { roomsAPI } from "../services/api";
import { FiFilter, FiGrid, FiList, FiMapPin, FiRefreshCw, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Rooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({});

  const fetchRooms = useCallback(async (newFilters = {}, reset = false, newPage = 0) => {
    const currentFilters = { ...filters, ...newFilters };
    
    if (reset) {
      setLoading(true);
      setPage(0);
    } else if (newPage > 0) {
      setLoadingMore(true);
    }
    
    const params = {
      page: reset ? 0 : newPage,
      size: 20,
      sortBy,
      sortDir: 'desc',
      ...currentFilters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    try {
      const data = await roomsAPI.searchRooms(params);
      
      let roomsArray = [];
      let total = 0;
      
      if (Array.isArray(data)) {
        roomsArray = data;
        total = data.length;
      } else if (data?.content && Array.isArray(data.content)) {
        roomsArray = data.content;
        total = data.totalElements || 0;
      } else {
        roomsArray = [];
        total = 0;
      }
      
      if (reset || newPage === 0) {
        setRooms(roomsArray);
      } else {
        setRooms(prev => [...prev, ...roomsArray]);
      }
      
      setTotalResults(total);
      setHasMore(roomsArray.length === 20);
      setFilters(currentFilters);
      
      // Update URL without page refresh
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      
      const newUrl = `/rooms${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
      
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load rooms. Please try again.');
      setRooms([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, sortBy]);

  // Initial load
  useEffect(() => {
    const params = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    
    // Convert string values to proper types
    const processedParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'maxRent' || key === 'minRent') {
        processedParams[key] = parseInt(value) || undefined;
      } else if (value) {
        processedParams[key] = value;
      }
    });
    
    fetchRooms(processedParams, true);
  }, []);

  // Handle search from CombinedBar
  const handleSearch = (searchFilters) => {
    setPage(0);
    fetchRooms(searchFilters, true);
  };

  // Load more rooms
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRooms({}, false, nextPage);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setPage(0);
    fetchRooms({}, true);
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'rent', label: 'Price: Low to High' },
    { value: 'rentDesc', label: 'Price: High to Low' },
    { value: 'area', label: 'Area' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        {/* Search Bar */}
        <div className="mb-8">
          <CombinedBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Rooms in Pune
            </h1>
            <p className="text-slate-600 mt-2">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" />
                  Searching rooms...
                </span>
              ) : (
                `Found ${totalResults.toLocaleString()} room${totalResults !== 1 ? 's' : ''} matching your criteria`
              )}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <FiList size={20} />
              </button>
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
            <p className="text-slate-600 mb-6">
              Try adjusting your filters or search in a different area
            </p>
            <button
              onClick={() => {
                setFilters({});
                fetchRooms({}, true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Rooms Grid/List */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Loading more rooms...
                    </>
                  ) : (
                    'Load More Rooms'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Average Response Time', value: '2.4 hours' },
            { label: 'Owner Verified', value: '98%' },
            { label: 'Satisfaction Rate', value: '4.8/5' },
            { label: 'Instant Contact', value: '100%' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
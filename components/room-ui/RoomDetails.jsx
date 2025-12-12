"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  FiMapPin,
  FiHome,
  FiUsers,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiTv,
  FiWifi,
  FiZoomIn,
  FiMaximize2,
} from "react-icons/fi";

import {
  MdOutlineLocalParking,
  MdOutlineElevator,
  MdDeck,
  MdOutlineSmokeFree,
  MdOutlineNoFood,
  MdOutlineLiquor,
  MdSecurity,
} from "react-icons/md";

import { GiWashingMachine } from "react-icons/gi";
import { TbAirConditioning, TbMicrowave, TbTable } from "react-icons/tb";
import { FaCctv, FaRegSnowflake } from "react-icons/fa";

import { useRouter } from "next/navigation";

export default function RoomDetailsUI({
  room = {},
  images = [],
  currentImageIndex = 0,
  setCurrentImageIndex = () => {},
  isFavorite = false,
  handleFavorite = () => {},
  handleShare = () => {},
}) {
  const router = useRouter();
  const address = room?.address || {};
  const safeImages = images.length ? images : ["/no-image.jpg"];
  const imageContainerRef = useRef(null);

  /** -------------------------------------
   *  IMPROVED IMAGE GALLERY STATE
   * ------------------------------------- */
  const [localIndex, setLocalIndex] = useState(currentImageIndex || 0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  /** -------------------------------------
   *  IMPROVED TOUCH HANDLING
   * ------------------------------------- */
  const onTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const diff = touchStartX - touchEndX;
    const swipeThreshold = 60;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        setLocalIndex((i) => (i + 1) % safeImages.length);
      } else {
        // Swipe right - previous image
        setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  /** -------------------------------------
   *  KEYBOARD NAVIGATION
   * ------------------------------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        setLocalIndex((i) => (i + 1) % safeImages.length);
      } else if (e.key === "ArrowLeft") {
        setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [safeImages.length, isFullscreen]);

  /** -------------------------------------
   *  IMAGE LOADING HANDLER
   * ------------------------------------- */
  const handleImageLoad = (index) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  /** -------------------------------------
   *  AMENITY ICON MAP
   * ------------------------------------- */
  const getAmenityIcon = (key) => {
    const map = {
      wifi: FiWifi,
      ac: TbAirConditioning,
      geyser: FiDroplet,
      washing_machine: GiWashingMachine,
      refrigerator: FaRegSnowflake,
      microwave: TbMicrowave,
      tv: FiTv,
      cupboard: FiHome,
      lift: MdOutlineElevator,
      parking: MdOutlineLocalParking,
      security: MdSecurity,
      cctv: FaCctv,
      housekeeping: FiHome,
      attached_bathroom: FiHome,
      balcony: MdDeck,
      study_table: TbTable,
      water_purifier: FiDroplet,
      inverter: FiHome,
      no_non_veg: MdOutlineNoFood,
      no_smoking: MdOutlineSmokeFree,
      no_alcohol: MdOutlineLiquor,
      no_outsiders: MdSecurity,
    };
    return map[key] || FiHome;
  };

  const amenityGroups = {
    essentials: [
      "WIFI",
      "AC",
      "GEYSER",
      "WASHING_MACHINE",
      "REFRIGERATOR",
      "MICROWAVE",
      "TV",
      "CUPBOARD",
    ],
    facilities: [
      "PARKING",
      "LIFT",
      "SECURITY",
      "CCTV",
      "HOUSEKEEPING",
      "WATER_PURIFIER",
      "INVERTER",
    ],
    features: ["ATTACHED_BATHROOM", "BALCONY", "STUDY_TABLE"],
    rules: ["NO_NON_VEG", "NO_SMOKING", "NO_ALCOHOL", "NO_OUTSIDERS"],
  };

  const formatAmenity = (t) =>
    t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const formatBHK = (t) => {
    if (!t) return "Room";
    const m = t.match(/BHK(\d+)/i);
    return m ? `${m[1]} BHK` : t;
  };

  /** -------------------------------------
   *  FULLSCREEN IMAGE VIEW
   * ------------------------------------- */
  const FullscreenView = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full max-w-6xl h-full flex items-center justify-center p-4">
          <button
            onClick={() => setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1))}
            className="absolute left-4 lg:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <FiChevronLeft size={28} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={safeImages[localIndex]}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              alt="Room fullscreen view"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
              {localIndex + 1} / {safeImages.length}
            </div>
          </div>

          <button
            onClick={() => setLocalIndex((i) => (i + 1) % safeImages.length)}
            className="absolute right-4 lg:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <FiChevronRight size={28} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <FullscreenView />
      
      <div className="animate-fadeInSlow px-3 sm:px-6 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            
            {/* --------------------------------------------------------
             *  LEFT - MODERN IMAGE GALLERY
             * ------------------------------------------------------ */}
            <div className="space-y-4">
              {/* Main Image Container with Enhanced UI */}
              <div className="relative group">
                <div
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-lg"
                  ref={imageContainerRef}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {/* Image with Smart Loading */}
                  <div className="relative w-full aspect-[4/3] flex items-center justify-center">
                    {!imageLoaded[localIndex] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    <img
                      src={safeImages[localIndex]}
                      className={`
                        w-full h-full object-contain transition-all duration-300
                        ${imageLoaded[localIndex] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                        cursor-zoom-in
                      `}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      onLoad={() => handleImageLoad(localIndex)}
                      onClick={() => setIsFullscreen(true)}
                      alt={`Room image ${localIndex + 1}`}
                    />
                  </div>

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
                      title="View fullscreen"
                    >
                      <FiMaximize2 size={20} />
                    </button>

                    {/* Gallery Button */}
                    <button
                      onClick={() => router.push(`/room/${room.id}/gallery?photo=${localIndex}`)}
                      className="absolute top-4 left-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg"
                      title="View gallery"
                    >
                      <FiZoomIn size={20} />
                    </button>
                  </div>

                  {/* Navigation Arrows - Desktop */}
                  {safeImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 transform hidden md:block"
                        aria-label="Previous image"
                      >
                        <FiChevronLeft size={24} />
                      </button>

                      <button
                        onClick={() => setLocalIndex((i) => (i + 1) % safeImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 transform hidden md:block"
                        aria-label="Next image"
                      >
                        <FiChevronRight size={24} />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {localIndex + 1} / {safeImages.length}
                  </div>

                  {/* Swipe Indicator - Mobile */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 md:hidden">
                    <FiChevronLeft size={14} />
                    <span>Swipe to navigate</span>
                    <FiChevronRight size={14} />
                  </div>
                </div>

                {/* Enhanced Thumbnail Grid */}
                {safeImages.length > 1 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-700">Gallery</h3>
                      <span className="text-xs text-slate-500">{safeImages.length} photos</span>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                      {safeImages.map((src, index) => (
                        <button
                          key={index}
                          onClick={() => setLocalIndex(index)}
                          className={`
                            relative overflow-hidden rounded-lg transition-all duration-300
                            ${index === localIndex 
                              ? 'ring-2 ring-purple-500 ring-offset-2 scale-[1.02] shadow-md' 
                              : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'
                            }
                            aspect-square
                          `}
                          aria-label={`View image ${index + 1}`}
                        >
                          {/* Thumbnail Loader */}
                          {!imageLoaded[index] && (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
                          )}
                          
                          <img
                            src={src}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                            alt={`Thumbnail ${index + 1}`}
                            onLoad={() => handleImageLoad(index)}
                          />
                          
                          {/* Active Indicator */}
                          {index === localIndex && (
                            <div className="absolute inset-0 bg-purple-500/20 pointer-events-none"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex-1 justify-center"
                >
                  <FiHeart className={isFavorite ? "text-red-500" : "text-slate-600"} size={20} />
                  <span className="text-sm font-medium text-slate-700">
                    {isFavorite ? "Saved" : "Save"}
                  </span>
                </button>
                
                <div className="w-px h-6 bg-slate-200"></div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex-1 justify-center"
                >
                  <FiShare2 className="text-slate-600" size={20} />
                  <span className="text-sm font-medium text-slate-700">Share</span>
                </button>
                
                <div className="w-px h-6 bg-slate-200"></div>
                
                <button
                  onClick={() => router.push(`/room/${room.id}/gallery`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex-1 justify-center"
                >
                  <FiZoomIn className="text-slate-600" size={20} />
                  <span className="text-sm font-medium text-slate-700">View All</span>
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------
             *  RIGHT - ENHANCED ROOM DETAILS
             * ------------------------------------------------------ */}
            <aside className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-semibold">
                      {formatBHK(room.type)}
                    </span>
                    {room.isVerified && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Verified
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {room.title || `${formatBHK(room.type)} in ${address.area}`}
                  </h1>

                  <div className="flex items-center gap-2 text-slate-600">
                    <FiMapPin className="text-purple-500" />
                    <span className="text-sm md:text-base">{address.area}, {address.city}</span>
                  </div>
                </div>
              </div>

              {/* Price Card - Enhanced */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Monthly Rent</p>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900">
                      ₹{room.rent?.toLocaleString("en-IN") || "0"}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      + ₹{room.deposit?.toLocaleString("en-IN") || "0"} security deposit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Available</p>
                    <p className="text-sm font-semibold text-green-600">Immediately</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FiHome className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Furnishing</p>
                      <p className="font-semibold text-slate-900">{room.furnished || "Semi-furnished"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FiUsers className="text-pink-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Preferred for</p>
                      <p className="font-semibold text-slate-900">
                        {room.gender === "BOYS" ? "Boys" : 
                         room.gender === "GIRLS" ? "Girls" : "Anyone"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Section - Enhanced */}
              {room.amenities?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                    Amenities & Features
                  </h3>

                  <div className="space-y-6">
                    {Object.entries(amenityGroups).map(([groupName, group]) => {
                      const available = group.filter((x) => room.amenities.includes(x));
                      if (!available.length) return null;

                      return (
                        <div key={groupName} className="border-t border-slate-100 pt-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                            {groupName.replace(/_/g, " ")}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {available.map((item, idx) => {
                              const Icon = getAmenityIcon(item.toLowerCase());
                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                  <div className={`p-2 rounded-lg ${
                                    groupName === "rules" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"
                                  }`}>
                                    <Icon size={18} />
                                  </div>
                                  <span className="text-sm font-medium text-slate-800">
                                    {formatAmenity(item)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Description
                </h3>
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {room.description || "No description provided. Contact owner for more details."}
                  </p>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    const phone = "911234567890";
                    const message = `Hi, I'm interested in your ${room.type} at ${address.area}.`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                  Contact on WhatsApp
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
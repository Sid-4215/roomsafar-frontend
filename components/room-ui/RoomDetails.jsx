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

  const [localIndex, setLocalIndex] = useState(currentImageIndex || 0);
  const [customMessage, setCustomMessage] = useState("");

  const safeImages = images.length ? images : ["/no-image.jpg"];

  /** ------------------------------
   * INSTAGRAM STYLE SWIPE HANDLING
   * ---------------------------- */
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const onTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const onTouchMove = (e) => setTouchEndX(e.touches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;

    if (diff > 50) setLocalIndex((i) => (i + 1) % safeImages.length);
    if (diff < -50)
      setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));

    setTouchStartX(null);
    setTouchEndX(null);
  };

  /** ------------------------------
   * DESKTOP → KEYBOARD ARROWS SUPPORT
   * ---------------------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight")
        setLocalIndex((i) => (i + 1) % safeImages.length);
      if (e.key === "ArrowLeft")
        setLocalIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [safeImages.length]);

  /** ------------------------------
   * ICON MAP — FEATURES
   * ---------------------------- */
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

  const formatBHK = (type) => {
    if (!type) return "Room";
    const m = type.match(/BHK(\d+)/i);
    return m ? `${m[1]} BHK` : type;
  };

  return (
    <div className="animate-fadeInSlow px-3 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          
          {/* ------------------------------------
           * LEFT SIDE — INSTAGRAM SWIPE GALLERY
           * ---------------------------------- */}
          <div className="space-y-3">
            <div
              className="relative overflow-hidden rounded-xl bg-black"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* SLIDER WRAPPER */}
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${localIndex * 100}%)`,
                  width: `${safeImages.length * 100}%`,
                }}
              >
                {safeImages.map((src, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <img
                      src={src}
                      className="w-full h-[250px] sm:h-[320px] md:h-[360px] lg:h-[420px] object-cover"
                      loading="lazy"
                      decoding="async"
                      onClick={() =>
                        router.push(`/room/${room.id}/gallery?photo=${localIndex}`)
                      }
                      alt="Room"
                    />
                  </div>
                ))}
              </div>

              {/* DESKTOP ARROWS */}
              {safeImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLocalIndex((i) =>
                        i === 0 ? safeImages.length - 1 : i - 1
                      )
                    }
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow"
                  >
                    <FiChevronLeft size={22} />
                  </button>

                  <button
                    onClick={() =>
                      setLocalIndex((i) => (i + 1) % safeImages.length)
                    }
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow"
                  >
                    <FiChevronRight size={22} />
                  </button>
                </>
              )}

              {/* IMAGE COUNTER */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                {localIndex + 1} / {safeImages.length}
              </div>
            </div>

            {/* THUMBNAILS */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {safeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() =>
                    router.push(`/room/${room.id}/gallery?photo=${i}`)
                  }
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === localIndex ? "border-purple-600" : "border-transparent"
                  }`}
                >
                  <img
                    src={src}
                    className="w-full h-16 object-cover"
                    alt="thumb"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ------------------------------------
           * RIGHT PANEL — ROOM DETAILS
           * ---------------------------------- */}
          <aside className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {formatBHK(room.type)}
                </span>

                <h1 className="text-xl font-semibold mt-3">
                  {room.title || `${formatBHK(room.type)} in ${address.area}`}
                </h1>

                <div className="flex items-center gap-2 text-slate-600 mt-2 text-sm">
                  <FiMapPin /> {address.area}, {address.city}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFavorite}
                  className="p-2 rounded-full hover:bg-slate-100"
                >
                  <FiHeart
                    className={isFavorite ? "text-red-500" : "text-slate-500"}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-slate-100"
                >
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* RENT */}
            <div className="bg-purple-50 p-4 rounded-xl border mb-5">
              <p className="text-purple-700 text-sm">Monthly rent</p>
              <p className="text-3xl font-bold mt-1">
                ₹{room.rent?.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                + ₹{room.deposit?.toLocaleString("en-IN")} security deposit
              </p>
            </div>

            {/* QUICK INFO */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiHome className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Furnishing</p>
                  <p className="font-medium">{room.furnished}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiUsers className="text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Preferred for</p>
                  <p className="font-medium">
                    {room.gender === "BOYS"
                      ? "Boys"
                      : room.gender === "GIRLS"
                      ? "Girls"
                      : "Anyone"}
                  </p>
                </div>
              </div>
            </div>

            {/* AMENITIES */}
            {room.amenities?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-800">Amenities</h3>

                {Object.entries(amenityGroups).map(([groupName, group]) => {
                  const available = group.filter((x) =>
                    room.amenities.includes(x)
                  );
                  if (!available.length) return null;

                  return (
                    <div key={groupName} className="mt-4">
                      <h4
                        className={`text-xs font-semibold uppercase ${
                          groupName === "rules"
                            ? "text-red-500"
                            : "text-slate-500"
                        }`}
                      >
                        {groupName}
                      </h4>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {available.map((item, idx) => {
                          const Icon = getAmenityIcon(item.toLowerCase());
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <Icon
                                className={`text-lg ${
                                  groupName === "rules"
                                    ? "text-red-600"
                                    : "text-slate-700"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  groupName === "rules"
                                    ? "text-red-600"
                                    : "text-slate-700"
                                }`}
                              >
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
            )}

            {/* DESCRIPTION */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-800">Description</h3>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                {room.description || "No description provided."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

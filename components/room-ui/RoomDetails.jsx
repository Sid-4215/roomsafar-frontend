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

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const minSwipeDistance = 40;

  const imageRef = useRef(null);

  const toIconKey = (value) =>
    value.toLowerCase().replace(/__/g, "_").replace(/\s+/g, "_");

  // ⭐ ICON MAP with fallback handling
  const getAmenityIcon = (key) => {
    const iconMap = {
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

    const IconComponent = iconMap[key];
    return IconComponent || FiHome;
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

  const formatAmenity = (text) =>
    text.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const safeImages = images.length ? images : ["/no-image.jpg"];

  const prevImage = () =>
    setLocalIndex((p) => (p === 0 ? safeImages.length - 1 : p - 1));

  const nextImage = () =>
    setLocalIndex((p) => (p === safeImages.length - 1 ? 0 : p + 1));

  const onTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const onTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;

    if (diff > minSwipeDistance) nextImage();
    if (diff < -minSwipeDistance) prevImage();
  };

  useEffect(() => {
    const area = address.area || "";
    const city = address.city || "";
    setCustomMessage(
      `Hi, I am interested in your ${room?.type || "room"} at ${area}${
        area && city ? ", " : ""
      }${city}. Please share more details.`
    );
  }, [room]);

  // Check if we have a valid room object
  if (!room || Object.keys(room).length === 0) {
    return (
      <div className="animate-fadeInSlow px-3 sm:px-6 flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-slate-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  const formatBHK = (type) => {
  if (!type) return "Room";
  const match = type.match(/BHK(\d+)/i);
  return match ? `${match[1]} BHK` : type;
};


  return (
    <div className="animate-fadeInSlow px-3 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

          {/* LEFT IMAGES */}
          <div className="space-y-3">
            <div
              className="relative rounded-xl overflow-hidden bg-white shadow-sm"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              ref={imageRef}
            >
              <img
                src={safeImages[localIndex]}
                className="w-full h-[250px] sm:h-[320px] md:h-[360px] lg:h-[420px] object-cover"
                onClick={() => {
                  if (room?.id) {
                    router.push(`/room/${room.id}/gallery?photo=${localIndex}`);
                  }
                }}
                alt="Room"
              />

              {safeImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2.5 rounded-full shadow"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2.5 rounded-full shadow"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {localIndex + 1} / {safeImages.length}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {safeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (room?.id) {
                      router.push(`/room/${room.id}/gallery?photo=${i}`);
                    }
                  }}
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === localIndex ? "border-purple-600" : "border-transparent"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img 
                    src={src} 
                    className="w-full h-16 object-cover" 
                    alt={`Room thumbnail ${i + 1}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <aside className="bg-white p-6 rounded-2xl shadow-sm border">

            {/* Top Info */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {formatBHK(room.type)}
                </span>

                <h1 className="text-xl font-semibold mt-3">
                  {room.title || `${formatBHK(room.type)} in ${address.area || ""}`}
                </h1>

                <div className="flex items-center gap-2 text-slate-600 mt-2 text-sm">
                  <FiMapPin /> {address.area || ""}, {address.city || ""}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleFavorite} 
                  className="p-2 rounded-full hover:bg-slate-100"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart className={isFavorite ? "text-red-500" : "text-slate-500"} />
                </button>

                <button 
                  onClick={handleShare} 
                  className="p-2 rounded-full hover:bg-slate-100"
                  aria-label="Share"
                >
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-purple-50 p-4 rounded-xl border mb-5">
              <p className="text-purple-700 text-sm">Monthly rent</p>
              <p className="text-3xl font-bold mt-1">
                ₹{room.rent?.toLocaleString("en-IN") || "0"}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                + ₹{room.deposit?.toLocaleString("en-IN") || "0"} security deposit
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiHome className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Furnishing</p>
                  <p className="font-medium">{room.furnished || "Not specified"}</p>
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

            {/* Amenities */}
            {room.amenities?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-800">Amenities</h3>

                {Object.entries(amenityGroups).map(([groupName, groupItems]) => {
                  const available = groupItems.filter((a) =>
                    room.amenities.includes(a)
                  );
                  if (available.length === 0) return null;

                  return (
                    <div key={groupName} className="mt-4">
                      <h4
                        className={`text-xs font-semibold ${
                          groupName === "rules" ? "text-red-500" : "text-slate-500"
                        } uppercase`}
                      >
                        {groupName.replace(/_/g, " ")}
                      </h4>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {available.map((a, idx) => {
                          const IconComponent = getAmenityIcon(toIconKey(a));
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <IconComponent
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
                                {formatAmenity(a)}
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

            {/* Description */}
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
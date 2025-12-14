"use client";
import { useRouter } from "next/router";
import Image from "next/image";
import { memo, useState } from "react";
import { getPrimaryImage, ensureAbsoluteUrl } from "@/utils/imageUtils";
import {
  FiHeart,
  FiMapPin,
  FiHome,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";

// ⚡ Memoized to avoid re-renders → smooth scrolling
export default memo(function RoomCard({ room }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const primaryImage = getPrimaryImage(room.images);
  const img = ensureAbsoluteUrl(primaryImage?.url) || "/no-image.jpg";
  const area = room.address?.area || "Area";
  const city = room.address?.city || "City";

  const formatINR = (n) =>
    typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "₹—";

  const formatRoomType = (type) => {
    if (!type) return "Room";
    if (type.startsWith("BHK")) return `${type.replace("BHK", "")}BHK`;
    if (type === "RK") return "1RK";
    return type;
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Save current scroll position
    if (typeof window !== 'undefined') {
      localStorage.setItem('roomsScrollPosition', window.scrollY.toString());
      
      // Save room click for analytics if needed
      const clickData = {
        roomId: room.id,
        timestamp: Date.now(),
        scrollPosition: window.scrollY
      };
      sessionStorage.setItem('lastRoomClick', JSON.stringify(clickData));
    }
    
    // Use shallow routing if possible
    router.push(`/room/${room.id}`, undefined, { shallow: false });
  };

  return (
    <div
      onClick={handleClick}
      className="
        group
        bg-white/90 
        border border-white/40
        rounded-3xl overflow-hidden 
        shadow-[0_8px_25px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)]
        transition-all duration-300
        hover:-translate-y-1 cursor-pointer
        active:scale-[0.98]

        /* GPU acceleration + reduced scroll jank */
        will-change-transform
        [transform:translateZ(0)]
      "
    >
      {/* IMAGE — FIXED ASPECT RATIO + NO LAYOUT SHIFT */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
        <Image
          src={imgError ? "/no-image.jpg" : img}
          alt={`Room in ${area}, ${city}`}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="
            object-cover 
            transition-transform duration-700 ease-out
            group-hover:scale-110
            will-change-transform
            [transform:translateZ(0)]
          "
          onError={() => setImgError(true)}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* TAGS */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {room.isVerified && (
            <span
              className="
                flex items-center gap-1 px-2.5 py-1 
                bg-green-100 text-green-700 text-xs font-semibold
                rounded-full shadow
              "
            >
              <FiCheckCircle size={13} /> Verified
            </span>
          )}

          <span
            className="
              px-3 py-1 text-xs font-semibold
              bg-purple-600 text-white rounded-full shadow
            "
          >
            {formatRoomType(room.type)}
          </span>
        </div>

        {/* RENT */}
        <div
          className="
            absolute top-4 right-4 
            bg-white/90 px-4 py-1.5 rounded-xl shadow backdrop-blur-md
          "
        >
          <span className="text-lg font-bold text-slate-900">
            {formatINR(room.rent)}
          </span>
          <span className="text-xs text-slate-600">/mo</span>
        </div>

        {/* HEART ICON */}
        <div
          className="
            absolute bottom-4 right-4 
            bg-white/90 p-2 
            rounded-full shadow-md hover:bg-white transition
          "
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic here
          }}
        >
          <FiHeart size={20} className="text-slate-700" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
          <FiMapPin size={14} className="text-purple-600" />
          {area}, {city}
        </div>

        <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {room.description ||
            "A comfortable living space perfect for students or working professionals."}
        </p>

        {/* FEATURES */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <FiHome size={15} className="text-indigo-500" />
            {room.furnished || "Semi-furnished"}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700">
            <FiUsers size={15} className="text-pink-500" />
            {room.gender === "BOYS"
              ? "Boys"
              : room.gender === "GIRLS"
              ? "Girls"
              : "Anyone"}
          </div>
        </div>
      </div>
    </div>
  );
});
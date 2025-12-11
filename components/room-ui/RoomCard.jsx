"use client";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  FiHeart,
  FiMapPin,
  FiHome,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";

export default function RoomCard({ room }) {
  const router = useRouter();
  const [error, setError] = useState(false);

  const img = room?.images?.[0]?.url || "/no-image.jpg";
  const area = room.address?.area || "Area";
  const city = room.address?.city || "City";

  const formatINR = (n) =>
    typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "₹—";

  return (
    <div
      onClick={() => router.push(`/room/${room.id}`)}
      className="
        bg-white/70 backdrop-blur-xl
        border border-white/40
        rounded-3xl overflow-hidden 
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_45px_rgba(0,0,0,0.18)]
        transition-all duration-500 
        hover:-translate-y-2 cursor-pointer
      "
    >
      {/* IMAGE */}
      <div className="relative h-64 overflow-hidden rounded-3xl">
        <img
          src={error ? '/no-image.jpg' : img}
          onError={() => setError(true)}
          className="
            w-full h-full object-cover
            transition-transform duration-700
            group-hover:scale-110
          "
        />

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* TAGS */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {room.isVerified && (
            <span className="
              flex items-center gap-1 px-2.5 py-1 
              bg-green-100/90 text-green-700 text-xs font-semibold
              rounded-full shadow
            ">
              <FiCheckCircle size={13} /> Verified
            </span>
          )}

          <span className="
            px-3 py-1 text-xs font-semibold
            bg-purple-600/90 text-white rounded-full
            shadow-lg
          ">
            {room.type || "Room"}
          </span>
        </div>

        {/* RENT TAG */}
        <div className="
          absolute top-4 right-4 
          bg-white/90 backdrop-blur-xl
          px-4 py-1.5 rounded-xl shadow
        ">
          <span className="text-lg font-bold text-slate-900">
            {formatINR(room.rent)}
          </span>
          <span className="text-xs text-slate-500">/mo</span>
        </div>

        {/* HEART ICON */}
        <div
          className="
            absolute bottom-4 right-4 
            bg-white/90 backdrop-blur-xl p-2 
            rounded-full shadow-md hover:bg-white 
            transition
          "
        >
          <FiHeart size={20} className="text-slate-700" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 pb-6">
        {/* <h3 className="text-xl font-semibold text-slate-900 leading-tight line-clamp-1">
          {room.title || "Beautiful Room"}
        </h3> */}

        <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
          <FiMapPin size={14} className="text-purple-600" />
          {area}, {city}
        </div>

        {/* DESCRIPTION */}
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
}

import { FiMapPin, FiHome, FiUsers, FiStar } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/router";

export default function RoomCard({ room }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const firstImage = room.imageUrls?.[0] || "/no-image.jpg";
  const rating = room.rating || 4.5;

  const getTypeLabel = (type) => {
    const labels = {
      RK: "1 RK",
      BHK1: "1 BHK",
      BHK2: "2 BHK",
      SHARED: "Shared Room",
      PG: "PG",
    };
    return labels[type] || type;
  };

  const area = room.address?.area || "Unknown Area";
  const city = room.address?.city || "City";

  return (
    <div
      className="
        group bg-white rounded-2xl border border-slate-200 shadow-sm 
        hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
        overflow-hidden cursor-pointer
      "
      onClick={() => router.push(`/room/${room.id}`)}
    >
      
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageError ? "/no-image.jpg" : firstImage}
          alt={`${area} room`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          {room.isVerified && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <FiStar size={10} /> Verified
            </span>
          )}
          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
            {getTypeLabel(room.type)}
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-lg font-bold text-slate-900">
            ₹{room.rent?.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 ml-1">/month</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          <FiMapPin size={14} className="text-slate-400" />
          <span className="text-sm text-slate-500">
            {area}, {city}
          </span>
        </div>

        {room.title && (
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
            {room.title}
          </h3>
        )}

        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
          {room.description || ""}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FiHome size={14} className="text-slate-400" />
            <span className="text-xs text-slate-600">
              {room.furnished || "Furnished"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiUsers size={14} className="text-slate-400" />
            <span className="text-xs text-slate-600">
              {room.gender === "BOYS"
                ? "Boys Only"
                : room.gender === "GIRLS"
                ? "Girls Only"
                : "Anyone"}
            </span>
          </div>
        </div>

        {/* Rating only - no button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700 ml-1">
              {rating}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

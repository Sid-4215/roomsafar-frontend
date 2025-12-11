// import { FiMapPin, FiHome, FiUsers, FiStar } from "react-icons/fi";
// import { useState } from "react";
// import { useRouter } from "next/router";

// export default function RoomCard({ room }) {
//   const router = useRouter();
//   const [imageError, setImageError] = useState(false);

//   // ⭐ FIXED: Use backend response → room.images[].url
//   const firstImage = room?.images?.[0]?.url || "/no-image.jpg";

//   const rating = room.rating || 4.5;

//   const getTypeLabel = (type) => {
//     const labels = {
//       RK: "1 RK",
//       BHK1: "1 BHK",
//       BHK2: "2 BHK",
//       SHARED: "Shared Room",
//       PG: "PG",
//     };
//     return labels[type] || type;
//   };

//   const area = room.address?.area || "Unknown Area";
//   const city = room.address?.city || "City";

//   return (
//     <div
//       className="
//         group bg-white rounded-2xl border border-slate-200 shadow-sm 
//         hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
//         overflow-hidden cursor-pointer
//       "
//       onClick={() => router.push(`/room/${room.id}`)}
//     >
      
//       {/* Image */}
//       <div className="relative h-56 overflow-hidden">
//         <img
//           src={imageError ? "/no-image.jpg" : firstImage}
//           alt={`${area} room`}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//           onError={() => setImageError(true)}
//           loading="lazy"
//         />

//         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

//         <div className="absolute top-3 left-3 flex gap-2">
//           {room.isVerified && (
//             <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
//               <FiStar size={10} /> Verified
//             </span>
//           )}
//           <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
//             {getTypeLabel(room.type)}
//           </span>
//         </div>

//         <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
//           <span className="text-lg font-bold text-slate-900">
//             ₹{room.rent?.toLocaleString("en-IN")}
//           </span>
//           <span className="text-xs text-slate-500 ml-1">/month</span>
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="flex items-center gap-1 mb-2">
//           <FiMapPin size={14} className="text-slate-400" />
//           <span className="text-sm text-slate-500">
//             {area}, {city}
//           </span>
//         </div>

//         {room.title && (
//           <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
//             {room.title}
//           </h3>
//         )}

//         <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
//           {room.description || ""}
//         </p>

//         <div className="grid grid-cols-2 gap-2 mb-4">
//           <div className="flex items-center gap-2">
//             <FiHome size={14} className="text-slate-400" />
//             <span className="text-xs text-slate-600">
//               {room.furnished || "Furnished"}
//             </span>
//           </div>

//           <div className="flex items-center gap-2">
//             <FiUsers size={14} className="text-slate-400" />
//             <span className="text-xs text-slate-600">
//               {room.gender === "BOYS"
//                 ? "Boys Only"
//                 : room.gender === "GIRLS"
//                 ? "Girls Only"
//                 : "Anyone"}
//             </span>
//           </div>
//         </div>

//         {/* Rating */}
//         <div className="flex items-center justify-between pt-3 border-t border-slate-100">
//           <div className="flex items-center gap-1">
//             <div className="flex">
//               {[...Array(5)].map((_, i) => (
//                 <FiStar
//                   key={i}
//                   size={14}
//                   className={
//                     i < Math.floor(rating)
//                       ? "text-yellow-400 fill-yellow-400"
//                       : "text-slate-300"
//                   }
//                 />
//               ))}
//             </div>
//             <span className="text-sm font-medium text-slate-700 ml-1">
//               {rating}
//             </span>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }


import { FiMapPin, FiHome, FiUsers, FiStar } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/router";

export default function RoomCard({ room }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // first image fallback
  const firstImage = room?.images?.[0]?.url || "/no-image.jpg";

  // tweak default rating to feel premium
  const rating = room.rating ?? 4.8;

  const getTypeLabel = (type) => {
    const labels = {
      RK: "1 RK",
      BHK1: "1 BHK",
      BHK2: "2 BHK",
      BHK3: "3 BHK",
      SHARED: "Shared Room",
      PG: "PG",
    };
    return labels[type] || type;
  };

  const area = room.address?.area || "Unknown Area";
  const city = room.address?.city || "City";

  return (
    <div
      onClick={() => router.push(`/room/${room.id}`)}
      className="
        group cursor-pointer
        bg-white/70 backdrop-blur-xl
        rounded-3xl border border-white/30
        shadow-[0px_4px_30px_rgba(0,0,0,0.12)]
        overflow-hidden transition-all duration-500
        hover:shadow-[0px_8px_50px_rgba(0,0,0,0.20)]
        hover:-translate-y-3 hover:bg-white/90
      "
    >
      {/* IMAGE */}
      <div className="relative w-full h-64 overflow-hidden rounded-3xl">
        <img
          src={imageError ? "/no-image.jpg" : firstImage}
          onError={() => setImageError(true)}
          className="
            w-full h-full object-cover
            transition-transform duration-700
            group-hover:scale-110 group-hover:brightness-110
          "
          alt="room"
        />

        {/* dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {room.isVerified && (
            <span className="
              px-3 py-1 text-xs font-semibold
              bg-green-500/90 text-white rounded-full shadow
            ">
              ✓ Verified
            </span>
          )}
          <span className="
            px-3 py-1 text-xs font-semibold
            bg-white/80 backdrop-blur-md
            text-slate-800 rounded-full shadow
          ">
            {getTypeLabel(room.type)}
          </span>
        </div>

        {/* price tag */}
        <div className="
          absolute bottom-4 right-4
          px-4 py-2 rounded-2xl
          bg-white/80 backdrop-blur-xl
          shadow-lg border border-white/60
        ">
          <span className="text-xl font-semibold text-slate-900">
            ₹{room.rent?.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 ml-1">/month</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {/* location */}
        <div className="flex items-center gap-2 text-slate-600 mb-2">
          <FiMapPin size={15} className="text-slate-400" />
          <span className="text-sm font-medium">
            {area}, {city}
          </span>
        </div>

        {/* title */}
        <h3 className="
          text-lg font-semibold text-slate-900 mb-2
          line-clamp-1 tracking-tight
        ">
          {room.title}
        </h3>

        {/* description */}
        <p className="
          text-sm text-slate-600 mb-4
          line-clamp-2 leading-relaxed
        ">
          {room.description || ""}
        </p>

        {/* features */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="
              w-8 h-8 flex items-center justify-center
              bg-indigo-50 rounded-xl shadow-sm
            ">
              <FiHome size={14} className="text-indigo-500" />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {room.furnished ?? "Furnished"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="
              w-8 h-8 flex items-center justify-center
              bg-pink-50 rounded-xl shadow-sm
            ">
              <FiUsers size={14} className="text-pink-500" />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {room.gender === "BOYS"
                ? "Boys Only"
                : room.gender === "GIRLS"
                ? "Girls Only"
                : "Anyone"}
            </span>
          </div>
        </div>

        {/* rating */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
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
            <span className="text-sm font-medium text-slate-700 ml-1">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

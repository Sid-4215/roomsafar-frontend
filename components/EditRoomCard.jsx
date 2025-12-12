"use client";
import { FiEdit, FiTrash2, FiMapPin, FiHome, FiUsers } from "react-icons/fi";
import { useState } from "react";

export default function EditRoomCard({ room, onEdit, onDelete }) {
  const [error, setError] = useState(false);

  const img = room?.images?.[0]?.url || "/no-image.jpg";
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

  // ⭐ FIXED DEPOSIT DISPLAY ⭐
  const formatDeposit = (d) => {
    if (d === 0) return "Deposit: 0";
    if (!d) return null;
    return `Deposit: ₹${d.toLocaleString("en-IN")}`;
  };

  return (
    <div
      className="
      bg-white border rounded-2xl shadow-sm overflow-hidden
      hover:shadow-md transition-all duration-300
    "
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={error ? "/no-image.jpg" : img}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />

        {/* Tag */}
        <span
          className="
            absolute top-3 left-3 
            bg-purple-600 text-white px-3 py-1 text-xs rounded-full
          "
        >
          {formatRoomType(room.type)}
        </span>
      </div>

      <div className="p-4">
        {/* Rent */}
        <div className="text-xl font-bold text-slate-900">
          {formatINR(room.rent)}
          <span className="text-sm text-slate-500"> / month</span>
        </div>

        {/* Deposit (Fix applied) */}
        {formatDeposit(room.deposit) && (
          <div className="text-sm text-slate-600 mt-1">
            {formatDeposit(room.deposit)}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-slate-600 mt-3 text-sm">
          <FiMapPin size={15} className="text-purple-600" />
          {area}, {city}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3">
          <span className="text-xs px-3 py-1 bg-slate-100 rounded-full">
            {room.furnished}
          </span>
          <span className="text-xs px-3 py-1 bg-slate-100 rounded-full">
            {room.gender === "BOYS"
              ? "Boys"
              : room.gender === "GIRLS"
              ? "Girls"
              : "Anyone"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-5 pt-3 border-t">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <FiEdit /> Edit
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

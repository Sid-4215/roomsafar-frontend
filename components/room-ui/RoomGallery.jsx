"use client";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiShare2, FiDownload } from "react-icons/fi";
import { useRouter } from "next/router";
import { roomsAPI } from "../../services/api";
import toast from "react-hot-toast";

const LABEL_DISPLAY = {
  BEDROOM: { title: "Bedroom", emoji: "🛏️" },
  HALL: { title: "Living Room / Hall", emoji: "🛋️" },
  KITCHEN: { title: "Kitchen", emoji: "🍳" },
  BATHROOM: { title: "Bathroom", emoji: "🚿" },
  EXTERIOR: { title: "Exterior", emoji: "🏢" },
  BALCONY: { title: "Balcony", emoji: "🌿" },
  PARKING: { title: "Parking Area", emoji: "🅿️" },
  OTHER: { title: "Other Photos", emoji: "📷" },
};

export default function SectionGallery({ roomId }) {
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (roomId) load();
  }, [roomId]);

  const load = async () => {
    try {
      const data = await roomsAPI.getRoomById(roomId);
      setRoom(data);
    } catch {
      toast.error("Failed to load images");
      router.back();
    }
  };

  if (!room) return <div className="p-10 text-center">Loading…</div>;

  const images = room.images || [];

  // GROUP IMAGES BY LABEL
  const grouped = images.reduce((acc, img) => {
    const key = img.label?.toUpperCase() || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});

  const sections = Object.keys(grouped);

  const openLightbox = (section, index) => {
    setOpenSection(section);
    setOpenIndex(index);
  };

  const closeLightbox = () => {
    setOpenSection(null);
    setOpenIndex(null);
  };

  const nextImage = () => {
    const list = grouped[openSection];
    setOpenIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    const list = grouped[openSection];
    setOpenIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const share = () => {
    if (navigator.share) navigator.share({ url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const formatRoomType = (type) => {
  if (!type) return "Room";

  type = type.toUpperCase().replace(/[^A-Z0-9]/g, ""); 
  // Cleans: "BHK3." → "BHK3"

  const bhkMatch = type.match(/BHK(\d+)/);
  if (bhkMatch) return `${bhkMatch[1]}BHK`;

  const rkMatch = type.match(/RK(\d+)/);
  if (rkMatch) return `${rkMatch[1]} RK`;

  if (type === "SHARED") return "Shared Room";
  if (type === "PG") return "PG";

  // fallback
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

  return (
    <div className="min-h-screen bg-white">
      {/* TOP NAV */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center z-20">
        <button
          onClick={() => router.push(`/room/${roomId}`)}
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <FiArrowLeft /> Back
        </button>

        <button
          onClick={share}
          className="p-2 border rounded-xl hover:bg-gray-100"
        >
          <FiShare2 />
        </button>
      </div>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold">Photos — {formatRoomType(room.type)}</h1>

        <p className="text-gray-600">
          {room.address?.area}, {room.address?.city}
        </p>
      </div>

      {/* SECTION BASED GALLERY */}
      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        {sections.map((section) => {
          const secImages = grouped[section];
          const labelInfo = LABEL_DISPLAY[section] || LABEL_DISPLAY["OTHER"];

          return (
            <div key={section} className="space-y-4">
              {/* SECTION TITLE */}
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">{labelInfo.emoji}</span>
                {labelInfo.title}{" "}
                <span className="text-gray-500 text-lg">
                  ({secImages.length})
                </span>
              </h2>

              {/* GRID LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {secImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => openLightbox(section, index)}
                  >
                    <img
                      src={img.url}
                      className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {openSection !== null && openIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              onClick={closeLightbox}
              className="text-2xl px-2 py-1 hover:bg-white/10 rounded"
            >
              ✕
            </button>

            <div className="text-sm opacity-80">
              {LABEL_DISPLAY[openSection]?.title} — Photo{" "}
              {openIndex + 1}/{grouped[openSection].length}
            </div>

            <button onClick={share} className="px-3 py-2 bg-white/10 rounded">
              <FiShare2 />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={prevImage}
              className="absolute left-5 text-white text-4xl px-4 py-2 hover:bg-white/10 rounded-full"
            >
              ‹
            </button>

            <img
              src={grouped[openSection][openIndex].url}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-xl"
            />

            <button
              onClick={nextImage}
              className="absolute right-5 text-white text-4xl px-4 py-2 hover:bg-white/10 rounded-full"
            >
              ›
            </button>
          </div>

          {/* Thumbnails */}
          <div className="bg-black/70 p-4 flex gap-2 overflow-x-auto">
            {grouped[openSection].map((img, idx) => (
              <img
                key={idx}
                onClick={() => setOpenIndex(idx)}
                src={img.url}
                className={`h-16 w-24 object-cover rounded-lg cursor-pointer border-2 ${
                  idx === openIndex ? "border-white" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

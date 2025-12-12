"use client";
import React, { useEffect, useState, useRef } from "react";
import { FiArrowLeft, FiShare2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/router";
import { roomsAPI } from "../../services/api";
import toast from "react-hot-toast";

const LABEL_DISPLAY = {
  BEDROOM: { title: "Bedroom", emoji: "🛏️" },
  HALL: { title: "Living Room", emoji: "🛋️" },
  KITCHEN: { title: "Kitchen", emoji: "🍳" },
  BATHROOM: { title: "Bathroom", emoji: "🚿" },
  EXTERIOR: { title: "Exterior", emoji: "🏢" },
  BALCONY: { title: "Balcony", emoji: "🌿" },
  PARKING: { title: "Parking", emoji: "🅿️" },
  OTHER: { title: "Other", emoji: "📷" },
};

export default function SectionGallery({ roomId }) {
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [openLightbox, setOpenLightbox] = useState({ section: null, index: null });
  const [expanded, setExpanded] = useState({});
  const stickyRefs = useRef({});

  useEffect(() => {
    if (roomId) load();
  }, [roomId]);

  const load = async () => {
    try {
      const data = await roomsAPI.getRoomById(roomId);
      setRoom(data);

      // Make all sections open initially
      const sections = [...new Set(data.images.map((i) => i.label || "OTHER"))];
      const initial = {};
      sections.forEach((s) => (initial[s] = true));
      setExpanded(initial);
    } catch {
      toast.error("Failed to load images");
      router.back();
    }
  };

  const share = () => {
    if (navigator.share) navigator.share({ url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (!room) return <div className="p-10 text-center">Loading…</div>;

  const grouped = room.images.reduce((acc, img) => {
    const key = img.label?.toUpperCase() || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});

  const sections = Object.keys(grouped);

  const openImage = (section, index) =>
    setOpenLightbox({ section, index });

  const closeLightbox = () =>
    setOpenLightbox({ section: null, index: null });

  const next = () => {
    const imgs = grouped[openLightbox.section];
    setOpenLightbox((p) => ({
      section: p.section,
      index: p.index === imgs.length - 1 ? 0 : p.index + 1,
    }));
  };

  const prev = () => {
    const imgs = grouped[openLightbox.section];
    setOpenLightbox((p) => ({
      section: p.section,
      index: p.index === 0 ? imgs.length - 1 : p.index - 1,
    }));
  };

  const formatRoomType = (type) => {
  if (!type) return "Room";

  type = type.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // BHK → 1BHK, 2BHK, 3BHK
  const bhk = type.match(/BHK(\d+)/);
  if (bhk) return `${bhk[1]} BHK`;

  // RK → 1 RK, 2 RK
  const rk = type.match(/RK(\d+)/);
  if (rk) return `${rk[1]} RK`;

  if (type === "SHARED") return "Shared Room";
  if (type === "PG") return "PG / Hostel";

  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


  return (
    <div className="min-h-screen bg-white">
      {/* TOP NAV */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center z-20 shadow-sm">
        <button
          onClick={() => router.push(`/room/${roomId}`)}
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <FiArrowLeft /> Back
        </button>

        <button onClick={share} className="p-2 border rounded-xl hover:bg-gray-100">
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

      {/* SECTIONS */}
      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-16">
        {sections.map((section) => {
          const info = LABEL_DISPLAY[section] || LABEL_DISPLAY.OTHER;
          const imgs = grouped[section];

          return (
            <div key={section}>
              {/* Sticky Section Title */}
              <div
                ref={(el) => (stickyRefs.current[section] = el)}
                className="sticky top-12 bg-white/80 backdrop-blur-md py-2 flex justify-between items-center z-10 border-b"
              >
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">{info.emoji}</span>
                  {info.title}
                </h2>

                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))
                  }
                  className="p-2 rounded hover:bg-gray-100"
                >
                  {expanded[section] ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {/* Collapsible Grid */}
              {expanded[section] && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 transition-all duration-300">
                  {imgs.map((img, i) => (
                    <div
                      key={img.id}
                      onClick={() => openImage(section, i)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      {/* Blur loading effect */}
                      <img
                        src={img.url}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {openLightbox.section && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* top */}
          <div className="p-4 flex justify-between text-white">
            <button
              onClick={closeLightbox}
              className="text-2xl px-2 py-1 hover:bg-white/10 rounded"
            >
              ✕
            </button>

            <div className="opacity-80">
              {LABEL_DISPLAY[openLightbox.section]?.title} •{" "}
              {openLightbox.index + 1}/{grouped[openLightbox.section].length}
            </div>

            <button onClick={share} className="px-3 py-2 bg-white/10 rounded">
              <FiShare2 />
            </button>
          </div>

          {/* main */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={prev}
              className="absolute left-6 text-white text-4xl p-3 rounded-full hover:bg-white/20"
            >
              ‹
            </button>

            <img
              src={grouped[openLightbox.section][openLightbox.index].url}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-xl"
            />

            <button
              onClick={next}
              className="absolute right-6 text-white text-4xl p-3 rounded-full hover:bg-white/20"
            >
              ›
            </button>
          </div>

          {/* thumbnails */}
          <div className="bg-black/70 p-3 flex gap-2 overflow-x-auto">
            {grouped[openLightbox.section].map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                onClick={() =>
                  setOpenLightbox({ section: openLightbox.section, index: idx })
                }
                className={`h-16 w-24 object-cover rounded-lg cursor-pointer border-2 ${
                  idx === openLightbox.index ? "border-white" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

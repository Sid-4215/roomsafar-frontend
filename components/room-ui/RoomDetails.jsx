// components/room-ui/RoomDetailsUI.jsx
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
  FiPhone,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/router";


/**
 * RoomDetailsUI
 * Props:
 *  - room: object (from API)
 *  - images: array of image URLs (room.images.map(i => i.url))
 *  - currentImageIndex, setCurrentImageIndex, isFavorite, handleFavorite, handleShare
 *
 * Notes:
 *  - Uses touch swipe, arrow & keyboard navigation.
 *  - Responsive with max width to avoid huge desktop rendering.
 */

export default function RoomDetailsUI({
  room,
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
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const minSwipeDistance = 40;
  const imageRef = useRef(null);

  // Keep parent-controlled index (if provided) in sync
  useEffect(() => {
    setLocalIndex(currentImageIndex || 0);
  }, [currentImageIndex]);

  // update parent setter when localIndex changes
  useEffect(() => {
    if (typeof setCurrentImageIndex === "function") setCurrentImageIndex(localIndex);
  }, [localIndex, setCurrentImageIndex]);

  // init message when room loads
  useEffect(() => {
    const area = address.area || "";
    const city = address.city || "";
    setCustomMessage(
      `Hi, I am interested in your ${room?.type || "room"} at ${area}${area && city ? ", " : ""}${city}. Please share more details.`
    );
  }, [room]); // eslint-disable-line

  // keyboard navigation for images
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [localIndex, images.length]); // eslint-disable-line

  const prevImage = () =>
    setLocalIndex((p) => (p === 0 ? Math.max(images.length - 1, 0) : p - 1));
  const nextImage = () =>
    setLocalIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  // touch handlers
  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();
  };

  // click thumbnail handler
  const selectThumbnail = (idx) => setLocalIndex(idx);

  // Contact actions
  const handleWhatsAppSend = () => {
    if (!room?.whatsapp) return;
    const phone = room.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowContactPopup(false);
    setSelectedMethod(null);
  };

  const handleCall = () => {
    if (!room?.phone) return;
    const tel = room.phone.replace(/\s/g, "");
    window.location.href = `tel:${tel}`;
    setShowContactPopup(false);
  };

  // guard image array
  const safeImages = (images && images.length) ? images : ["/no-image.jpg"];

  return (
    <div className="animate-fadeInSlow px-3 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl"> {/* limit width for large screens */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

          {/* LEFT: Image gallery */}
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
            alt={`Photo ${localIndex + 1}`}
            className="w-full h-[250px] sm:h-[320px] md:h-[360px] lg:h-[420px] object-cover cursor-pointer"
            draggable={false}
            onClick={() => router.push(`/room/${room.id}/gallery?photo=${localIndex}`)}
            />
              {/* left arrow */}
              {safeImages.length > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full shadow hover:scale-105 transition"
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  <button
                    aria-label="Next image"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full shadow hover:scale-105 transition"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}

              {/* counter */}
              <div className="absolute bottom-3 right-3 bg-black/65 text-white px-3 py-1 rounded-full text-sm">
                {localIndex + 1} / {safeImages.length}
              </div>
            </div>

            {/* thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {safeImages.map((src, i) => (
                <button
                key={i}
                onClick={() => router.push(`/room/${room.id}/gallery?photo=${i}`)}
                className={`rounded-lg overflow-hidden border-2 transition ${
                    i === localIndex ? "border-purple-600 shadow-md" : "border-transparent hover:border-purple-200"
                }`}
                aria-label={`Show photo ${i + 1}`}
                >
                <img
                    src={src}
                    className="w-full h-14 sm:h-16 object-cover cursor-pointer"
                    alt={`thumb-${i}`}
                    draggable={false}
                />
                </button>
            ))}
            </div>
        </div>

        
          {/* RIGHT: Details */}
          <aside className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border">
            {/* header */}
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {room?.type || "Room"}
                </span>

                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-3 truncate">
                  {room?.title || `${room?.type ?? "Room"} in ${address?.area ?? ""}`}
                </h1>

                <div className="flex items-center gap-2 text-slate-600 mt-2 text-sm">
                  <FiMapPin size={16} />
                  <div className="truncate">
                    {address?.area}{address?.area && address?.city ? ", " : ""}{address?.city}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <button
                  onClick={handleFavorite}
                  className="p-2 rounded-full hover:bg-slate-100"
                  aria-pressed={isFavorite}
                  title={isFavorite ? "Remove favorite" : "Add favorite"}
                >
                  <FiHeart size={18} className={isFavorite ? "text-red-500" : "text-slate-500"} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-slate-100"
                  title="Share listing"
                  aria-label="Share"
                >
                  <FiShare2 size={18} />
                </button>
              </div>
            </div>

            {/* price */}
            <div className="bg-purple-50 p-4 rounded-xl mb-5 border border-purple-100">
              <div className="text-purple-700 text-sm font-medium">Monthly rent</div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                ₹{typeof room?.rent === "number" ? room.rent.toLocaleString("en-IN") : room?.rent ?? "—"}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">
                + ₹{typeof room?.deposit === "number" ? room.deposit.toLocaleString("en-IN") : room?.deposit ?? "—"} security deposit
              </div>
            </div>

            {/* quick info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiHome className="text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Furnishing</div>
                  <div className="font-medium text-sm mt-0.5">{room?.furnished ?? "—"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiUsers className="text-pink-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Preferred for</div>
                  <div className="font-medium text-sm mt-0.5">
                    {room?.gender === "BOYS" ? "Boys" : room?.gender === "GIRLS" ? "Girls" : "Anyone"}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <button
              onClick={() => setShowContactPopup(true)}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold mb-4"
              aria-haspopup="dialog"
            >
              Contact Now
            </button>

            {/* brokerage / amenities / description */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-800">Brokerage</h3>
              {!room?.brokerageRequired ? (
                <div className="text-green-600 font-medium mt-1">No brokerage</div>
              ) : (
                <div className="text-sm mt-1">₹{room?.brokerageAmount ?? "—"}</div>
              )}
            </div>

            {Array.isArray(room?.amenities) && room.amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-800">Amenities</h3>
                <ul className="mt-2 text-sm list-disc ml-5 text-slate-700">
                  {room.amenities.map((a, idx) => <li key={idx}>{a}</li>)}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-1">Description</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">{room?.description}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {showContactPopup && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl lg:rounded-xl p-5 relative shadow-xl">
            <button
              aria-label="Close contact"
              className="absolute right-4 top-4 text-slate-600"
              onClick={() => { setShowContactPopup(false); setSelectedMethod(null); }}
            >
              <FiX size={22} />
            </button>

            <h2 className="text-lg font-semibold mb-3">Contact Owner</h2>

            {/* Whatsapp */}
            {room?.whatsapp && (
              <button
                onClick={() => setSelectedMethod("whatsapp")}
                className="w-full flex items-center gap-3 p-3 bg-green-50 border rounded-lg mb-3"
                aria-pressed={selectedMethod === "whatsapp"}
              >
                <FaWhatsapp className="text-green-600 text-xl" />
                <span className="font-medium">WhatsApp</span>
              </button>
            )}

            {/* Phone */}
            {room?.phone && (
              <button
                onClick={handleCall}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 border rounded-lg mb-3"
              >
                <FiPhone className="text-blue-600 text-xl" />
                <span className="font-medium">Call Now</span>
              </button>
            )}

            {/* If user picked WhatsApp show textarea */}
            {selectedMethod === "whatsapp" && (
              <div className="mt-2">
                <label className="text-xs text-slate-600">Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg h-28 text-sm"
                  aria-label="Custom whatsapp message"
                />
                <button
                  onClick={handleWhatsAppSend}
                  className="mt-3 w-full py-3 bg-green-600 text-white rounded-lg font-semibold"
                >
                  Send on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE sticky contact */}
      <div className="fixed bottom-3 left-0 right-0 lg:hidden px-4 z-40">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setShowContactPopup(true)}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-lg"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

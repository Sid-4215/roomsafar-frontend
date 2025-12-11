"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

import RoomDetailsUI from "../../components/room-ui/RoomDetails";

import { roomsAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function RoomDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  /* Fetch Room Details */
  useEffect(() => {
    if (!id) return;
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getRoomById(id);
      setRoom(data);
    } catch (err) {
      toast.error("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  /* Share Handler */
  const handleShare = async () => {
    if (!room) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: room.title,
          text: "Check this room on Roomsafar",
          url: window.location.href,
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  /* Favorites */
  const handleFavorite = () => {
    setIsFavorite((p) => !p);
    toast.success(!isFavorite ? "Added to favorites" : "Removed from favorites");
  };

  const images = room?.images?.map((img) => img.url) || [];

  /* SEO Setup */
  const seoTitle = room
    ? `${room.type} in ${room.address?.area} — ₹${room.rent} | Roomsafar`
    : "Room Details";

  const seoDesc = room?.description?.substring(0, 160) || "Room details on Roomsafar";

  const canonicalUrl = `https://roomsafar.com/room/${id}`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        url={canonicalUrl}
        image={images[0] || "/no-image.jpg"}
      />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push("/rooms")}
          className="text-slate-600 hover:text-slate-900 mb-6 text-sm"
        >
          ← Back to Rooms
        </button>

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 w-1/3 rounded mb-6"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        ) : room ? (
          <RoomDetailsUI
            room={room}
            images={images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isFavorite={isFavorite}
            handleFavorite={handleFavorite}
            handleShare={handleShare}
          />
        ) : (
          <div className="py-20 text-center text-slate-600">
            Room not found
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

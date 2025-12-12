"use client";

import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomDetailsUI from "../../components/room-ui/RoomDetails";
import { roomsAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function RoomDetailsPage({ room }) {
  if (!room) {
    return (
      <>
        <Navbar />
        <main className="py-20 text-center text-slate-600">
          Room not found
        </main>
        <Footer />
      </>
    );
  }

  const images = room.images?.map((img) => img.url) || [];

  const url = `https://roomsafar.com/room/${room.id}`;

  // ⭐ FIXED SHARE HANDLER HERE
  const handleShare = async () => {
    const shareData = {
      title: room.type,
      text: room.description?.substring(0, 120),
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Unable to share");
    }
  };

  return (
    <>
      <Head>
        <title>{room.type} — ₹{room.rent} | Roomsafar</title>
        <meta name="description" content={room.description?.substring(0, 150)} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={room.type} />
        <meta property="og:description" content={room.description} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:url" content={url} />
      </Head>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ⭐ PASS handleShare DOWN */}
        <RoomDetailsUI
          room={room}
          images={images}
          handleShare={handleShare}
        />
      </main>

      <Footer />
    </>
  );
}

// SERVER-SIDE DATA
export async function getServerSideProps({ params }) {
  try {
    const room = await roomsAPI.getRoomById(params.id);
    return { props: { room } };
  } catch (err) {
    return { props: { room: null } };
  }
}

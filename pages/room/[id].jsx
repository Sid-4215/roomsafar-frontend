"use client";

import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomDetailsUI from "../../components/room-ui/RoomDetails";
import { roomsAPI } from "../../services/api";
import toast from "react-hot-toast";

const formatBHK = (type) => {
  if (!type) return "Room";
  const match = type.match(/BHK(\d+)/i);
  return match ? `${match[1]} BHK` : type;
};


export default function RoomDetailsPage({ room }) {
  if (!room) {
    return (
      <>
        <Navbar />
        <main className="py-20 text-center text-slate-600">Room not found</main>
        <Footer />
      </>
    );
  }

  const images = room.images?.map((img) => img.url) || [];
  
  const seoTitle = `${formatBHK(room.type)} in ${room.address?.area} — ₹${room.rent} | Roomsafar`;
  const seoDesc = room.description?.substring(0, 160) || "Room details on Roomsafar";
  const seoImage = images[0] || "https://roomsafar.com/og-image.png";
  const url = `https://roomsafar.com/room/${room.id}`;

  // ⭐ FIXED SHARE FUNCTION
const handleShare = async () => {
  const shareData = {
    title: `${formatBHK(room.type)} in ${room.address?.area}`,
    text: seoDesc,
    url: url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  } catch (err) {
    console.error("Share failed:", err);
    toast.error("Unable to share");
  }
};


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: seoTitle,
    description: seoDesc,
    image: images,
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: room.address?.area,
      addressRegion: "Pune",
      postalCode: room.address?.pincode,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: room.rent,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };


  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Roomsafar" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />

        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Head>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ⭐ PASS THE SHARE HANDLER HERE */}
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

export async function getServerSideProps({ params }) {
  try {
    const room = await roomsAPI.getRoomById(params.id);
    return { props: { room } };
  } catch {
    return { props: { room: null } };
  }
}

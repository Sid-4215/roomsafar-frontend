import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomDetailsUI from "../../components/room-ui/RoomDetails";
import { roomsAPI } from "../../services/api";

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

  const seoTitle = `${room.type} in ${room.address?.area} — ₹${room.rent} | Roomsafar`;
  const seoDesc =
    room.description?.substring(0, 160) || "Room details on Roomsafar";
  const seoImage = images[0] || "https://roomsafar.com/og-image.png";
  const url = `https://roomsafar.com/room/${room.id}`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />

        {/* OG Tags (WhatsApp reads these!) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={url} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
      </Head>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <RoomDetailsUI room={room} images={images} />
      </main>

      <Footer />
    </>
  );
}

// ✅ SERVER-SIDE RENDERING FIXES WHATSAPP PREVIEW
export async function getServerSideProps({ params }) {
  try {
    const room = await roomsAPI.getRoomById(params.id);
    return { props: { room } };
  } catch (err) {
    return { props: { room: null } };
  }
}

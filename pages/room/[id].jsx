import Head from "next/head";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomDetailsUI from "../../components/room-ui/RoomDetails";
import toast from "react-hot-toast";

/* -------------------- Helpers -------------------- */
const formatBHK = (type) => {
  if (!type) return "Room";
  const match = type.match(/BHK(\d+)/i);
  return match ? `${match[1]} BHK` : type;
};

/* -------------------- Page -------------------- */
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

  /* -------- Images (ABSOLUTE URLs ONLY) -------- */
  const images =
    room.images?.map((img) =>
      img.url.startsWith("http")
        ? img.url
        : `https://roomsafar.com${img.url}`
    ) || [];

  /* -------- SEO -------- */
  const seoTitle = `${formatBHK(room.type)} in ${
    room.address?.area || "Pune"
  } — ₹${room.rent} | Roomsafar`;

  const seoDesc =
    room.description?.substring(0, 160) ||
    "Find verified rooms and flats on Roomsafar with no brokerage.";

  const seoImage = `https://roomsafar.com/api/og/room/${room.id}?v=1`;
  const url = `https://roomsafar.com/room/${room.id}`;

  /* -------- Share -------- */
  const handleShare = async () => {
    const shareUrl = `${url}?share=wa`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: seoTitle,
          text: seoDesc,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      }
    } catch {
      toast.error("Unable to share");
    }
  };


  /* -------- Schema -------- */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: seoTitle,
    description: seoDesc,
    image: seoImage,
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
      {/* ================= SEO HEAD ================= */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Roomsafar" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>

      {/* ================= UI ================= */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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

/* -------------------- SSR (IMPORTANT) -------------------- */
export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/${params.id}`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) return { notFound: true };

    const room = await res.json();
    return { props: { room } };
  } catch {
    return { notFound: true };
  }
}

RoomDetailsPage.disableDefaultSEO = true;
// This page uses custom SEO tags based on room data
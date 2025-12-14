// RoomDetailsPage.js - UPDATED VERSION
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

// Helper to ensure absolute URLs
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  // Remove double slashes if any
  const cleanUrl = url.startsWith("//") ? url.substring(1) : url;
  return `https://roomsafar.com${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
};

/* -------------------- Page -------------------- */
export default function RoomDetailsPage({ room, siteUrl }) {
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
  const images = room.images?.map(img => ensureAbsoluteUrl(img.url)).filter(Boolean) || [];

  /* -------- SEO -------- */
  const seoTitle = `${formatBHK(room.type)} in ${
    room.address?.area || "Pune"
  } — ₹${room.rent} | Roomsafar`;

  const seoDesc =
    (room.description && room.description.length > 0) 
      ? `${room.description.substring(0, 155)}...` 
      : "Find verified rooms and flats on Roomsafar with no brokerage.";

  const url = `${siteUrl || 'https://roomsafar.com'}/room/${room.id}`;
  const shareUrl = `${url}?share=wa`;

  
  // Choose the best image for social media - FIXED
  const seoImage = `https://roomsafar.com/api/og/room/${room.id}`;


  /* -------- Share -------- */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: seoTitle,
          text: seoDesc,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
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

        {/* Open Graph - Essential for Facebook, LinkedIn */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seoTitle} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Roomsafar" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter - Essential for Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content={seoTitle} />
        <meta name="twitter:site" content="@roomsafar" />

        {/* Additional important meta tags */}
        <meta name="robots" content="index, follow" />
        <meta property="article:published_time" content={room.createdAt || new Date().toISOString()} />
        <meta property="article:author" content="Roomsafar" />
        
        {/* Price meta tags for better sharing */}
        <meta property="product:price:amount" content={room.rent} />
        <meta property="product:price:currency" content="INR" />

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
export async function getServerSideProps({ params, req }) {
  try {
    // Get the site URL dynamically
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/${params.id}`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) return { notFound: true };

    let room = await res.json();
    
    // Convert ALL image URLs to absolute during SSR
    if (room.images && Array.isArray(room.images)) {
      room.images = room.images.map(img => {
        if (!img.url) return img;
        
        // If URL is already absolute, keep it
        if (img.url.startsWith('http')) {
          return img;
        }
        
        // If it's a relative URL, make it absolute
        let cleanUrl = img.url;
        if (!cleanUrl.startsWith('/')) {
          cleanUrl = '/' + cleanUrl;
        }
        
        return {
          ...img,
          url: `${siteUrl}${cleanUrl}`
        };
      });
    }

    return { 
      props: { 
        room,
        siteUrl
      } 
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
}

RoomDetailsPage.disableDefaultSEO = true;
import { useState, useEffect } from "react";
import Head from "next/head";
// import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import RoomCard from "../components/room-ui/RoomCard";
import { roomsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popularAreas] = useState([
    { name: "Hinjewadi", count: 156, color: "from-blue-500 to-cyan-500" },
    { name: "Kharadi", count: 89, color: "from-purple-500 to-pink-500" },
    { name: "Baner", count: 134, color: "from-green-500 to-emerald-500" },
    { name: "Wakad", count: 76, color: "from-orange-500 to-red-500" },
    { name: "Viman Nagar", count: 98, color: "from-indigo-500 to-blue-500" },
    { name: "Kothrud", count: 67, color: "from-yellow-500 to-orange-500" },
  ]);

  const features = [
    {
      icon: "🔐",
      title: "Verified Listings",
      description: "Every room is personally verified for authenticity",
    },
    {
      icon: "📸",
      title: "Real Photos",
      description: "No stock images, only actual room photos",
    },
    {
      icon: "💰",
      title: "No Brokerage",
      description: "Direct owner contact, zero brokerage fees",
    },
    {
      icon: "⚡",
      title: "Instant Contact",
      description: "Connect with owners via WhatsApp instantly",
    },
  ];

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/featured`);
        const data = await res.json();
        let roomsArray = [];

        if (Array.isArray(data)) roomsArray = data;
        else if (data?.content) roomsArray = data.content;
        else if (data?.data) roomsArray = data.data;

        setFeaturedRooms(roomsArray.slice(0, 6));
      } catch (error) {
        toast.error("Failed to load featured rooms");
        setFeaturedRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  return (
    <>
      {/* SEO */}
      <Head>
        <title>Roomsafar – Rooms, PG, Flats & Shared Rooms in Pune | No Brokerage</title>
        <meta
          name="description"
          content="Find verified rooms, PGs & shared flats in Pune. No brokerage, direct owner contact, real photos."
        />
        <link rel="canonical" href="https://roomsafar.com/" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Roomsafar – Rooms, PG, Flats & Shared Rooms in Pune | No Brokerage" />
        <meta property="og:description" content="Find verified rooms, PGs & shared flats in Pune. No brokerage, direct owner contact, real photos." />
        <meta property="og:image" content="https://roomsafar.com/og-image.png" />
        <meta property="og:url" content="https://roomsafar.com/" />
        <meta property="og:site_name" content="Roomsafar" />

        <meta name="twitter:card" content="summary_large_image" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Roomsafar",
              url: "https://roomsafar.com",
              description:
                "Find verified rooms and PGs in Pune with no brokerage and direct owner contact.",
            }),
          }}
        />
      </Head>

      {/* =============================== */}
      {/*            UI START             */}
      {/* =============================== */}

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
        <Navbar />
        <Hero />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          {/* Features Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Why Choose Roomsafar?
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                We&apos;re changing the way people find rooms in Pune with transparency and trust
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Areas */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Popular Areas in Pune
                </h2>
                <p className="text-slate-600 mt-2">
                  Explore rooms in Pune&apos;s most sought-after localities
                </p>
              </div>
              <a
                href="/areas"
                className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2"
              >
                View all areas →
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularAreas.map((area) => (
                <a
                  key={area.name}
                  href={`/rooms?area=${encodeURIComponent(area.name)}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br via-transparent p-6 transition-all duration-300 hover:scale-105"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {area.name}
                    </h3>
                    <p className="text-sm text-slate-600">{area.count}+ listings</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Featured Rooms */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Featured Rooms
                </h2>
                <p className="text-slate-600 mt-2">
                  Handpicked rooms with great reviews and amenities
                </p>
              </div>

              <a
                href="/rooms"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                View All Rooms
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 rounded-2xl h-56 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No featured rooms available
                </h3>
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Room?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students and professionals who found their ideal stay through Roomsafar
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/rooms"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                Browse All Rooms
              </a>
              <a
                href="/post"
                className="px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition"
              >
                List Your Room Free
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

Home.disableDefaultSEO = true;


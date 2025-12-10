"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { FiMapPin, FiCheck } from "react-icons/fi";
import AnimatedSearch from "./search/AnimatedSearch";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const features = useMemo(
    () => [
      "Verified rooms",
      "Honest photos",
      "Transparent pricing",
      "Instant WhatsApp contact",
      "No brokerage fees",
    ],
    []
  );

  const dots = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 20,
      })),
    []
  );

  useEffect(() => setMounted(true), []);

  const handleHeroSearch = (area) => {
    const params = new URLSearchParams();
    if (area) params.set("area", area.trim());
    router.push(`/rooms${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.webp"
          alt="Modern apartments"
          className="w-full h-full object-cover scale-100"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Floating Dots */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {mounted &&
          dots.map((dot, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
                animation: `float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          ))}
      </div>

      {/* Content */}
      <div className="relative z-30 min-h-[72vh] flex items-center justify-center pt-32 pb-14">
        <div className="text-center max-w-5xl px-6 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm text-white mb-6">
            <FiMapPin />
            <span>Pune&apos;s #1 platform for students & professionals</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find your{" "}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              perfect stay
            </span>{" "}
            in minutes
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-6">
            Search rooms with verified photos, transparent pricing and instant
            WhatsApp contact.
          </p>

          {/* Search */}
          <div className="mt-4 mb-10">
            <AnimatedSearch onSearch={handleHeroSearch} />
          </div>

          {/* ⭐ CTAs ADDED HERE */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.push("/rooms")}
              className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md text-white font-semibold 
                        hover:bg-white/30 transition shadow-lg border border-white/30"
            >
              🔍 View Rooms
            </button>

            <button
              onClick={() => router.push("/post")}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold 
                        hover:bg-blue-700 transition shadow-lg"
            >
              🏠 Post Your Room
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm"
              >
                <FiCheck className="text-green-300" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
}

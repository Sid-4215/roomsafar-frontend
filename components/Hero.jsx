"use client";

import { useEffect, useState, useMemo } from "react";
import { FiMapPin, FiCheck } from "react-icons/fi";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="
        relative 
        h-[90vh] 
        min-h-[640px] 
        w-full 
        flex 
        items-center 
        justify-center 
        overflow-hidden
        pt-28            /* ⭐ FIX: pushes hero below navbar */
      "
    >
      {/* Background Image + Overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/60 to-purple-900/40 z-10" />

        <img
          src="/hero-bg.webp"
          alt="Modern apartments in Pune"
          className="w-full h-full object-cover scale-105 animate-zoomIn will-change-transform"
          loading="eager"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-20" />
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {mounted &&
          dots.map((dot, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full will-change-transform"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
                animation: `float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          ))}
      </div>

      {/* Content */}
      <div className="relative z-30 text-center max-w-5xl px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-white mb-8 shadow-md animate-fadeIn">
          <FiMapPin className="animate-pulse" />
          <span>Pune's #1 platform for students & professionals</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-white mb-6 animate-slideUp">
          Find your{" "}
          <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent animate-gradient">
            perfect stay
          </span>
          <br />
          in minutes
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeIn delay-100">
          Discover verified rooms with transparent pricing, honest photos,
          and direct owner contact. Designed for students and professionals in Pune.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fadeIn delay-200">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-medium shadow-sm"
            >
              <FiCheck className="text-green-300" />
              {feature}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn delay-300">
          <a
            href="/rooms"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            Explore Rooms
            <span className="text-xl">→</span>
          </a>

          <a
            href="/post"
            className="px-8 py-4 bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow"
          >
            List Your Room
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fadeIn delay-400">
          {[
            { value: "500+", label: "Verified Rooms" },
            { value: "₹0", label: "Brokerage Fees" },
            { value: "24/7", label: "Support" },
            { value: "100%", label: "Transparent" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes zoomIn {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.05);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-zoomIn {
          animation: zoomIn 20s ease-in-out infinite alternate;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}

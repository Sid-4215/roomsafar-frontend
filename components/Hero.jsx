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
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.webp"
          alt="Modern apartments in Pune"
          className="w-full h-full object-cover scale-105 animate-zoomIn will-change-transform"
          loading="eager"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-900/70 to-purple-900/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-20" />
      </div>

      {/* Floating Dots */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
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
      <div className="relative z-30 min-h-[90vh] flex items-center justify-center pt-36 md:pt-32 pb-20">
        <div className="text-center max-w-5xl px-6 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-white mb-8 shadow-md">
            <FiMapPin className="animate-pulse" />
            <span>Pune's #1 platform for students & professionals</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white mb-6">
            Find your{" "}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              perfect stay
            </span>
            <br />
            in minutes
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            Discover verified rooms with transparent pricing, honest photos,
            and direct owner contact. Designed for students and professionals in Pune.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm font-medium shadow-sm"
              >
                <FiCheck className="text-green-300 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/rooms"
              className="px-6 py-3.5 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-base md:text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              Explore Rooms <span className="text-xl">→</span>
            </a>

            <a
              href="/post"
              className="px-6 py-3.5 md:px-8 md:py-4 bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 rounded-2xl font-semibold text-base md:text-lg hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow"
            >
              List Your Room
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: "500+", label: "Verified Rooms" },
              { value: "₹0", label: "Brokerage Fees" },
              { value: "24/7", label: "Support" },
              { value: "100%", label: "Transparent" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
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
        .animate-zoomIn {
          animation: zoomIn 20s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
}

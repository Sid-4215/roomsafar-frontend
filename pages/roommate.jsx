import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiClock, FiUsers } from "react-icons/fi";

export default function RoommateComingSoon() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">

      {/* Navbar */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="
            bg-white shadow-xl rounded-3xl border border-slate-200 
            p-10 max-w-xl w-full text-center animate-[fadeIn_0.4s_ease-out]
          "
        >
          {/* Icon Circle */}
          <div className="mx-auto h-20 w-20 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <FiUsers size={40} className="text-indigo-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mt-6">
            Find Your Perfect Roommate
          </h1>

          <p className="text-slate-600 text-lg mt-3 leading-relaxed">
            We’re building an intelligent roommate–matching system that helps
            you find roommates who match your lifestyle, budget, and location.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
            <FiClock size={16} /> Coming Soon
          </div>

          {/* Bottom subtle text */}
          <p className="text-slate-500 text-sm mt-4">
            Stay tuned — something amazing is on the way 🚀
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import "@/styles/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "../contexts/AuthContext";
import ToastProvider from "../components/Toaster";
import SEO from "../components/SEO"; // ⭐ added

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* ⭐ Global SEO applies to every page */}
      <SEO />

      <div className={inter.className}>
        <Component {...pageProps} />
        <ToastProvider />
      </div>
    </AuthProvider>
  );
}

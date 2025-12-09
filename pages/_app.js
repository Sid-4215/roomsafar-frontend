import "@/styles/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "../contexts/AuthContext";
import ToastProvider from "../components/Toaster";
import SEO from "../components/SEO";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* Global SEO (default values) */}
      <SEO />

      <div className={inter.className}>
        <Component {...pageProps} />
        <ToastProvider />
      </div>
    </AuthProvider>
  );
}

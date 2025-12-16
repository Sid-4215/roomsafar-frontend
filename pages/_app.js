import "@/styles/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "../contexts/AuthContext";
import ToastProvider from "../components/Toaster";
import SEO from "../components/SEO";

import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const GA_ID = "G-354XX3YNVH"; // ✅ your GA ID

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // 🔁 Track page changes (VERY IMPORTANT)
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag("config", GA_ID, {
          page_path: url,
        });
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* ✅ Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <AuthProvider>
        {/* Global SEO ONLY if page does NOT disable it */}
        {Component.disableDefaultSEO !== true && <SEO />}

        <div className={inter.className}>
          <Component {...pageProps} />
          <ToastProvider />
        </div>
      </AuthProvider>
    </>
  );
}

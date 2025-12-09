// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>

        {/* Character Encoding */}
        <meta charSet="UTF-8" />

        {/* Theme Color */}
        <meta name="theme-color" content="#2563eb" />

        {/* Preconnect (Performance) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://roomsafar.com/" />

        {/* Google Identity API */}
        <script async src="https://accounts.google.com/gsi/client"></script>

        {/* ---------- BASIC SEO TAGS ---------- */}
        <meta
          name="description"
          content="Find verified rooms, PGs & shared flats in Pune. 100% no-brokerage, direct owner contact, instant WhatsApp, real photos. Roomsafar makes house hunting simple."
        />
        <meta
          name="keywords"
          content="rooms in pune, flat for rent pune, pg pune, shared room pune, no brokerage rooms pune, roomsafar"
        />
        <meta name="author" content="Roomsafar" />

        {/* ---------- OPEN GRAPH (SOCIAL SHARE) ---------- */}
        <meta property="og:title" content="Roomsafar – Find Rooms, PG & Shared Flats in Pune" />
        <meta
          property="og:description"
          content="Search verified & no-brokerage rooms in Pune. Direct owner contact. Instant WhatsApp. Real photos."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roomsafar.com/" />
        <meta property="og:image" content="https://roomsafar.com/og-image.png?v=2" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* ---------- TWITTER CARD ---------- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Roomsafar – Find Rooms, PG & Shared Flats in Pune" />
        <meta
          name="twitter:description"
          content="Search verified & no-brokerage rooms in Pune. Direct owner contact. Instant WhatsApp. Real photos."
        />
        <meta name="twitter:image" content="https://roomsafar.com/og-image.png?v=2" />

      </Head>

      <body className="antialiased bg-gray-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

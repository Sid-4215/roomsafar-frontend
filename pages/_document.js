// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>

        {/* Character Encoding */}
        <meta charSet="UTF-8" />

        {/* Mobile Viewport Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Theme Color (browser UI color) */}
        <meta name="theme-color" content="#2563eb" />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Canonical URL (SEO Best Practice) */}
        <link rel="canonical" href="https://roomsafar.in/" />

        {/* Google Identity API */}
        <script async src="https://accounts.google.com/gsi/client"></script>

        {/* Basic SEO Defaults */}
        <meta
          name="description"
          content="Find verified rooms, PGs, shared flats, and roommates in Pune — 100% no-brokerage, direct owner contact. Roomsafar helps you find your perfect stay with ease."
        />
        <meta
          name="keywords"
          content="rooms in pune, flat for rent pune, pg pune, shared room pune, no brokerage rooms pune, roomsafar"
        />
        <meta name="author" content="Roomsafar" />

      </Head>

      <body className="antialiased bg-gray-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

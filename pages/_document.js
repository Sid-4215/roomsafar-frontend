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

        {/* Google Login */}
        <script async src="https://accounts.google.com/gsi/client"></script>
      </Head>

      <body className="antialiased bg-gray-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

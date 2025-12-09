import Head from "next/head";

export default function SEO({
  title = "Roomsafar – Find Rooms & Flatmates in Pune",
  description = "Roomsafar helps students & professionals find verified rooms, PGs, and flatmates in Pune with transparent pricing.",
  keywords = "rooms in pune, pg in pune, rental rooms pune, flat for rent pune, room partner pune, shared room pune",
  image = "/hero-bg.webp",
  url = "https://roomsafar.com",
  noIndex = false,
}) {
  return (
    <Head>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Head>
  );
}

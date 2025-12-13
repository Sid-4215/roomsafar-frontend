import Head from "next/head";

export default function SEO({
  title = "Roomsafar – Find Rooms, PGs & Flatmates in Pune | No Brokerage",
  description = "Find verified rooms, PGs and shared flats in Pune. Direct owner contact and 100% transparency.",
  keywords = "rooms in pune, pg pune, flat for rent pune, shared room pune, roomsafar",
  image = "https://roomsafar.com/og-image.png",
  url = "https://roomsafar.com",
  noIndex = false,
}) {
  return (
    <Head>
      {/* Primary */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="RoomSafar"></meta>
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Head>
  );
}

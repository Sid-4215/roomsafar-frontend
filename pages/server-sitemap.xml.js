import { getServerSideSitemapLegacy } from "next-sitemap";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const config = {
  runtime: "nodejs",
};

export async function getServerSideProps(ctx) {
  let rooms = [];

  try {
    const res = await fetch(`${API_BASE}/api/rooms/all-ids`);
    rooms = await res.json();
  } catch (error) {
    console.error("Sitemap fetch error:", error);
    rooms = [];
  }

  const fields = rooms.map((id) => ({
    loc: `https://roomsafar.com/room/${id}`,
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 0.8,
  }));

  return getServerSideSitemapLegacy(ctx, fields);
}

export default function SiteMap() {}

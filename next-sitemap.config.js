/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://roomsafar.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,

  // ✅ allow Google to crawl room pages
  exclude: [],

  // Include server-generated dynamic sitemap for rooms
  additionalSitemaps: [
    "https://roomsafar.com/room/server-sitemap.xml",
  ],

  changefreq: "daily",
  priority: 0.7,
};

export default config;

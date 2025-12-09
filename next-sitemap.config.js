/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://roomsafar.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,

  exclude: ["/room/server-sitemap.xml", "/room/*"],

  additionalSitemaps: [
    "https://roomsafar.com/server-sitemap.xml",
  ],

  changefreq: "daily",
  priority: 0.7,
};

export default config;

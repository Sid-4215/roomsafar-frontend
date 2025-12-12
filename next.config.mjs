/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },

  experimental: {
    webpackBuildWorker: true,
    turbo: { enabled: false },
  },

  webpack: (config) => {
    config.devtool = "eval-source-map";
    return config;
  },
};

export default nextConfig;

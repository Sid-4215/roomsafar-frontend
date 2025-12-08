/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable Turbopack
  experimental: {
    webpackBuildWorker: true, // force webpack
    turbo: {
      enabled: false,
    },
  },

  // Fix source map issues
  webpack: (config) => {
    config.devtool = "eval-source-map";
    return config;
  }
};

export default nextConfig;

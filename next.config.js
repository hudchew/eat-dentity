const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '*.public.blob.vercel-storage.com',
          },
          {
            protocol: 'https',
            hostname: 'public.blob.vercel-storage.com',
          },
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
          },
        ],
      },
};

module.exports = withPWA(nextConfig);


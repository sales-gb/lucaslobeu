import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare D1 / R2 / Workers are edge-compatible.
  // For local dev we use Node.js adapter; CF adapter plugs in at build time.
  images: {
    // Allow locally-served uploads and remote CF R2 domains
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.lucaslobeu.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['better-sqlite3'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

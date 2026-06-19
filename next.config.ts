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
  // Hardening headers applied to every response. Defends the frontend against
  // clickjacking, MIME-sniffing, referrer leakage and unwanted browser APIs.
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js injects inline runtime scripts; 'unsafe-inline' is required for
      // the framework. 'unsafe-eval' is needed only in dev for Fast Refresh.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com https://*.lucaslobeu.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

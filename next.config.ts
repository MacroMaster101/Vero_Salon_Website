import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // Hide the floating Next.js dev badge in the corner during `next dev`.
  devIndicators: false,
  images: {
    // DiceBear is the avatar fallback for stylists/users (see lib/avatar.ts).
    // Its avatars are SVG, so allow SVG but sandbox it with a strict CSP.
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      // Supabase Storage public objects (media/avatars buckets) so uploads can
      // go through next/image instead of raw <img>.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Baseline security headers on every response (HSTS is added by Vercel).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No other site may frame ours (clickjacking).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

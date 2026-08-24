import type { NextConfig } from "next";

const tracker = (
  process.env.TRACKER_ORIGIN || "https://tracker.novaeats.co"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/grab/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/track/:path*", destination: `${tracker}/track/:path*` },
      { source: "/api/track", destination: `${tracker}/api/track` },
      { source: "/api/track/:path*", destination: `${tracker}/api/track/:path*` },
      { source: "/static/:path*", destination: `${tracker}/static/:path*` },
    ];
  },
};

export default nextConfig;

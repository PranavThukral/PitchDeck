import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "static1.squarespace.com",
      },
      {
        protocol: "https",
        hostname: "www.logo.wine",
      },
      {
        protocol: "https",
        hostname: "register.deca.ca",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "blueoceancompetition.org",
      },
      {
        protocol: "https",
        hostname: "diamondchallenge.org",
      },
      {
        protocol: "https",
        hostname: "www.rotman.utoronto.ca",
      },
      {
        protocol: "https",
        hostname: "execed.schulich.yorku.ca",
      },
      {
        protocol: "https",
        hostname: "cdn-ch-prod-bqhwa0ewbpg6eyc2.z01.azurefd.net",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "cdn.freebiesupply.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/dashboard/competitor/competitions",
        destination: "/competitions",
        permanent: false,
      },
      {
        source: "/dashboard/competitor/applications",
        destination: "https://tally.so/r/mOxbXY",
        permanent: false,
      },
      {
        source: "/dashboard/competitor/profile",
        destination: "/under-construction",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Accept, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

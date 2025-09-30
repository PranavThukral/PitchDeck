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
      {
        protocol: "https",
        hostname: "yellcanada.org",
      },
      {
        protocol: "https",
        hostname: "www.facebook.com",
      },
      {
        protocol: "https",
        hostname: "www.northumberland.ca",
      },
      {
        protocol: "https",
        hostname: "ires.ubc.ca",
      },
      {
        protocol: "https",
        hostname: "www.katika.com",
      },
      {
        protocol: "https",
        hostname: "www.drjobpro.com",
      },
      {
        protocol: "https",
        hostname: "docs.google.com",
      },
      {
        protocol: "https",
        hostname: "targetalpha.ca",
      },
      {
        protocol: "https",
        hostname: "www.theminaproject.ca",
      },
      {
        protocol: "https",
        hostname: "icontalent.org",
      },
      {
        protocol: "https",
        hostname: "jacanada.org",
      },
      {
        protocol: "https",
        hostname: "www.thecareeraccelerators.ca",
      },
      {
        protocol: "https",
        hostname: "schulich.yorku.ca",
      },
      {
        protocol: "https",
        hostname: "www.ivey.uwo.ca",
      },
      {
        protocol: "https",
        hostname: "extendedlearning.ubc.ca",
      },
      {
        protocol: "https",
        hostname: "www.brampton.ca",
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // SEO and performance headers for static assets
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "Accept",
            value: "(.*text/html.*)",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Cache headers for static assets
        source: "/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

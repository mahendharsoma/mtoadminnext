import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next.js 15 defaults dynamic cache to 0 — every click refetches from server.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "date-fns",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@tanstack/react-table",
    ],
  },
};

export default nextConfig;

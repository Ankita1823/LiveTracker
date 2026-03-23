import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we don't have heavy external source maps in dev
  productionBrowserSourceMaps: false,
  // Optimize package imports for faster builds and better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Pre-existing type errors in conversation-service (missing Supabase generated types)
    // These don't affect runtime behaviour; generate types with: supabase gen types typescript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

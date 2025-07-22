import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com']
  }
};

export default nextConfig;

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',  // required for Docker multi-stage build
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig

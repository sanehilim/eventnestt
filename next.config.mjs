import path from "node:path"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.alias["@react-native-async-storage/async-storage"] = false
    config.resolve.alias["viem/chains$"] = path.resolve("./lib/viem-chains-build-shim.ts")
    return config
  },
}

export default nextConfig

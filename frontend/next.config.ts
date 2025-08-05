import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorar RDKit no lado servidor para evitar erro de 'fs'
      config.externals = config.externals || [];
      config.externals.push('@rdkit/rdkit');
    } else {
      // No cliente, configurar fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;

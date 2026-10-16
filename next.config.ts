import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the parent directory otherwise makes Next guess wrong.
  turbopack: { root: __dirname },

  // firebase-admin ships gRPC/protobuf natives; keep it out of the bundler.
  serverExternalPackages: ["firebase-admin"],

  async redirects() {
    return [
      // /product was folded into the home page (Oct 15, 2026).
      { source: "/product", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

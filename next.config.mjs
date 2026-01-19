/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["node:child_process"]
  }
};

export default nextConfig;

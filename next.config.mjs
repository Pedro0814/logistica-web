/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a custom distDir to avoid stale .next artifacts
  distDir: '.next-dev',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;

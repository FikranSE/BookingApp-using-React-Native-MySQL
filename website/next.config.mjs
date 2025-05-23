/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'bookingsisi.maturino.my.id',
      'localhost',
      'j9d3hc82-3001.asse.devtunnels.ms'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'j9d3hc82-3001.asse.devtunnels.ms',
        pathname: '/uploads/**',
      },
    ],
  },
};

// Use ES module export syntax since this is a .mjs file
export default nextConfig;
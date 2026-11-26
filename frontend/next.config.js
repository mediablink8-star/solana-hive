/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://solana-hive-api.onrender.com',
    NEXT_PUBLIC_WS_URL: 'wss://solana-hive-api.onrender.com',
  },
};

module.exports = nextConfig;
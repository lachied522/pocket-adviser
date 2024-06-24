/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'financialmodelingprep.com',
            port: '',
            pathname: '/image-stock/**',
          },
          {
            protocol: 'https',
            hostname: 'cdn.snapi.dev',
            port: '',
            pathname: '/images/**',
          },
          {
            protocol: 'https',
            hostname: '*', // TO DO
            port: '',
            pathname: '*',
          },
        ],
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://academic-portal-16620c77.fastapicloud.dev/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
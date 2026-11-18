/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://academicportal.fastapicloud.dev/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
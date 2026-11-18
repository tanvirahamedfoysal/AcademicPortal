/** @type {import('next').NextConfig} */

const API_ORIGIN = (
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://academicportal.fastapicloud.dev'
).replace(/\/+$/, '');

const API_PREFIX = (process.env.FASTAPI_API_PREFIX || '/api/v1').replace(/\/+$/, '');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: `${API_PREFIX}/:path*`,
        destination: `${API_ORIGIN}${API_PREFIX}/:path*`,
      },
    ];
  },
};

export default nextConfig;

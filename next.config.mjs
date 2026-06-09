/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/football-data/:path*',
        destination: 'https://api.football-data.org/:path*',
      },
      {
        source: '/stream-proxy/:path*',
        destination: 'http://198.195.239.50:8095/:path*',
      },
    ]
  },
}

export default nextConfig;

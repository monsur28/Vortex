/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (process.env.CAPACITOR_BUILD === 'true') return [];
    
    return [

      {
        source: '/stream-proxy/:path*',
        destination: 'http://198.195.239.50:8095/:path*',
      },
    ]
  },
}

export default nextConfig;

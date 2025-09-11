/** @type {import('next').NextConfig} */
const nextConfig = {
  output:"export",
  // Ignore TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Remote image patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Rewrites for backend API calls
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5002'
const isDev = process.env.NODE_ENV === 'development'

/** @type {import('next').NextConfig} */
const nextConfig = {
      cacheComponents: true,
      
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'thumbs.dreamstime.com' },
      { protocol: 'https', hostname: 'dudhkoshihydro.aayumalunhydro.com.np' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/uploads/**' },
    ],
  },

  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${BACKEND_URL}/uploads/:path*` },
    ]
  },
}

export default nextConfig
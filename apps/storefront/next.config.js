/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    // Redirect old SPA routes to new Next.js routes
    async redirects() {
        return [
            {
                source: '/menu/:storeSlug',
                destination: '/:storeSlug',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;

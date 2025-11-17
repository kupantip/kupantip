import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/',
				destination: '/posts',
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			{
				source: '/backend/:path*',
				destination: `${process.env.BACKEND_URL}/:path*`, // Proxy to Backend
			},
		];
	},
};

export default nextConfig;

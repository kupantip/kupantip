import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function customMiddleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith('/api/proxy/')) {
		const backendUrl = process.env.BACKEND_URL;
		if (!backendUrl) {
			console.error(
				'Error: BACKEND_URL environment variable is not set.'
			);
			return new NextResponse(
				'Internal Server Error: Proxy not configured.',
				{
					status: 500,
				}
			);
		}

		const path = request.nextUrl.pathname.replace('/api/proxy', '/api/v1');

		const newUrl = new URL(path, backendUrl);
		newUrl.search = request.nextUrl.search;

		return NextResponse.rewrite(newUrl);
	}

	return NextResponse.next();
}

export default withAuth(
	customMiddleware,

	{
		pages: {
			signIn: '/login',
		},
		callbacks: {
			authorized({ req, token }) {
				const { pathname } = req.nextUrl;

				if (pathname.startsWith('/api/proxy/')) {
					return true;
				}
				if (
					pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|css|js)$/)
				) {
					return true;
				}

				if (pathname.startsWith('/create')) {
					return !!token;
				}

				return true;
			},
		},
	}
);

export const config = {
	matcher: [
		'/api/proxy/:path*',

		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};

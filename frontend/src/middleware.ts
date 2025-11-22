import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function customMiddleware(request: NextRequest) {
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

		const token = await getToken({ req: request });

		const path = request.nextUrl.pathname.replace('/api/proxy', '/api/v1');

		const newUrl = new URL(path, backendUrl);
		request.nextUrl.searchParams.forEach((value, key) => {
			newUrl.searchParams.append(key, value);
		});

		const headers = new Headers(request.headers);
		if (token?.accessToken) {
			headers.set('Authorization', `Bearer ${token.accessToken}`);
		}

		return NextResponse.rewrite(newUrl, {
			request: {
				headers,
			},
		});
	}

	// Block non-admin users from /posts/admin/*
	if (request.nextUrl.pathname.startsWith('/posts/admin')) {
		// The session is available on the token (from withAuth)
		// We'll check for the role in the authorized callback below
		// If this is reached, it means the user is authorized, so allow
		// (actual blocking is handled in the authorized callback)
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

				// Block non-admin users from /posts/admin/*
				if (pathname.startsWith('/posts/admin')) {
					// Only allow if token exists and role is admin
					return !!token && token.role === 'admin';
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

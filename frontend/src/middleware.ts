import { withAuth } from 'next-auth/middleware';

export default withAuth({
	pages: {
		signIn: '/login',
	},
	callbacks: {
		authorized({ req, token }) {
			// Allow static files without auth
			if (
				req.nextUrl.pathname.match(
					/\.(png|jpg|jpeg|svg|gif|ico|webp|css|js)$/
				)
			) {
				return true;
			}

			const publicPaths = ['/login', '/signup', '/forgot-password'];
			if (publicPaths.includes(req.nextUrl.pathname)) {
				return true;
			}

			if (req.nextUrl.pathname.startsWith('/admin')) {
				console.log(token, 'log at middleware');
				return token?.role === 'admin';
			}
			// Protect other routes
			return !!token;
		},
	},
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

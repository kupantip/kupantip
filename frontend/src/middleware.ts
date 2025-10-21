import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

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
                return true
            }

            // Protect /create path - require token
            if (req.nextUrl.pathname.startsWith('/create')) {
                return !!token
            }

            // All other paths are public
            return true
        },
    },
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
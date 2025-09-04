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
      if (req.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|css|js)$/)) {
        return true
      }
      // Protect other routes
      return !!token
    },
  },
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

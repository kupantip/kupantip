import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { login } from '@/services/user/auth'
import { cookies } from 'next/headers'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const { email, password } = credentials ?? {}

                if (!email || !password) return null

                try {
                    const res = await login({ email, password })

                    if (!res.user_id) return null
                    ;(await cookies()).set('token', res.token, {
                        httpOnly: true,
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 7 * 24 * 60 * 60,
                    })

                    return {
                        id: res.user_id,
                        name: res.display_name ?? res.email,
                        email: res.email,
                        role: res.role,
                        token: res.token
                    }
                } catch (err) {
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

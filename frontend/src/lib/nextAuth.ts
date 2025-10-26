import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login } from '@/services/user/auth';
import { cookies } from 'next/headers';
import axios from 'axios';

declare module 'next-auth' {
	interface Session {
		accessToken?: string;
	}

	interface User {
		token?: string;
		role?: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken?: string;
		role?: string;
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const { email, password } = credentials ?? {};
				if (!email || !password) return null;

				try {
					const res = await login({ email, password });
					if (!res.user_id) return null;

					return {
						id: res.user_id,
						name: res.display_name ?? res.email,
						email: res.email,
						role: res.role,
						token: res.token,
					};
				} catch {
					return null;
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
	callbacks: {
		async jwt({ token, user }) {
			if (user?.token) token.accessToken = user.token;
			if (user?.role) token.role = user.role;
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;

			// Set token in httpOnly cookie
			const cookieStore = await cookies();
			cookieStore.set('token', token.accessToken || '', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7, // 7 days
				path: '/',
			});

			const res = await axios.get(
				'http://localhost:8000/api/v1/user/profile',
				{
					headers: {
						Authorization: `Bearer ${token.accessToken}`,
					},
				}
			);

			session.user = res.data.user;

			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

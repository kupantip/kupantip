import 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			name?: string | null;
			email?: string | null;
			image?: string | null;
			accessToken?: string;
			role?: string;
			id?: string;
			user_id: string;
		};
	}
}

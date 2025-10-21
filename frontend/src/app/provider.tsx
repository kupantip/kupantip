'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const CustomProviders = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<SessionProvider>
			<QueryClientProvider client={new QueryClient()}>
				{children}
			</QueryClientProvider>
		</SessionProvider>
	);
};

// app/layout.tsx
'use client'
import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { Toaster } from "@/components/ui/sonner"


// export const metadata: Metadata = {
// 	title: 'KUPantip',
// 	description:
// 		'A platform for sharing and discovering tips and tricks in Kasetsart University.',
// };

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<SessionProvider>{children}</SessionProvider>
				<Toaster />
			</body>
		</html>
	);
}

import type { Metadata } from 'next';
import './globals.css';
import { CustomProviders } from './provider';

export const metadata: Metadata = {
	title: 'KUPantip',
	description:
		'A platform for sharing and discovering tips and tricks in Kasetsart University.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<CustomProviders>
			<html lang="en">
				<body>
					<main>{children}</main>
				</body>
			</html>
		</CustomProviders>
	);
}
